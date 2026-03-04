#!/bin/bash

set -e

APP_DIR="/root/app"
DOMAIN="edunityhub.com"

# Fix for broken MongoDB repo on Ubuntu 24.04 (Noble) if present
if [ -f /etc/apt/sources.list.d/mongodb-org-7.0.list ]; then
    rm /etc/apt/sources.list.d/mongodb-org-7.0.list
fi
# Remove any other potential mongodb lists that might be broken
rm -f /etc/apt/sources.list.d/mongo*.list
# Remove from main sources.list if present
if [ -f /etc/apt/sources.list ]; then
    sed -i '/mongodb/d' /etc/apt/sources.list
fi

# 1. System Updates & Essentials
apt-get update
apt-get install -y curl unzip git build-essential ca-certificates gnupg ufw

# Configure Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 2. Install Node.js 20.x
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# 3. Install MongoDB (Skipped - Using Atlas)
# The user is using MongoDB Atlas, so we don't need a local MongoDB instance.
# This saves significant RAM and CPU on the VPS.

# 4. Install Process Manager (PM2)
npm install -g pm2

# 5. Setup Backend
mkdir -p "$APP_DIR/backend"
# We assume the files are already copied to $APP_DIR by the user via SCP
cd "$APP_DIR/backend"
npm install
mkdir -p uploads

# Fix Permissions for Nginx Access
# Ensure /root is traversable
chmod 711 /root
# Ensure app directory is readable/executable
chmod -R 755 "$APP_DIR"

# Setup Environment Variables
if [ ! -f .env ]; then
  echo "Creating .env file..."
  echo "PORT=5000" > .env
  # Using the Atlas URI from the local project
  echo "MONGODB_URI=mongodb+srv://typingcompetition:typingcompetition22%23@cluster0.b58ewro.mongodb.net/typing_competition?retryWrites=true&w=majority" >> .env
  echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
fi

# Start/Restart Backend
pm2 delete backend || true
pm2 start server.js --name backend

# 6. Setup Frontend
cd "$APP_DIR/frontend"
# Update config.js for production to point to the VPS IP
# We use sed to replace the localhost URL with the VPS IP if it exists in the build or source
# However, simpler approach: The frontend build should use relative paths or the window.location logic.
# The current config.js uses: import.meta.env.PROD ? '' : 'http://localhost:5000'
# When built with 'vite build', import.meta.env.PROD is true, so API_BASE_URL becomes ''.
# This is perfect for Nginx reverse proxying (requests go to /api/...).

# Clean existing node_modules to prevent cross-platform issues
rm -rf node_modules package-lock.json

npm install
# npm run build  <-- Skipped because we upload the dist folder directly
# If you want to build on VPS, uncomment the line above and ensure dist is not uploaded or is overwritten

# 7. Setup Nginx
apt-get install -y nginx
mkdir -p /var/www/html
rm -rf /var/www/html/*

# Always build to ensure latest changes
echo "Building Frontend..."
npm run build
cp -r dist/* /var/www/html/

# Create Nginx Config
if [ -f "nginx_remote.conf" ]; then
    echo "Using provided nginx_remote.conf..."
    cp nginx_remote.conf /etc/nginx/sites-available/default
else
    echo "Creating default Nginx config..."
    cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    client_max_body_size 60M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /uploads/ {
        alias $APP_DIR/backend/uploads/;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
fi

# Restart Nginx
nginx -t
systemctl restart nginx

# Save PM2 list
pm2 save
# pm2 startup outputs a command that needs to be run.
# We capture that command and execute it.
# grep returns exit code 1 if no match, so we add || true to prevent set -e from killing the script
PM2_STARTUP_CMD=$(pm2 startup | grep "sudo env" || true)
if [ -n "$PM2_STARTUP_CMD" ]; then
    eval "$PM2_STARTUP_CMD"
else
    echo "PM2 startup command not found or already configured."
fi

# 8. Setup SSL with Certbot
echo "Setting up SSL..."
apt-get install -y certbot python3-certbot-nginx

# Stop Nginx to allow Certbot to run in standalone mode if nginx plugin fails,
# but here we use --nginx.
# The error "Could not automatically find a matching server block" usually means
# the nginx config hasn't been reloaded or the server_name doesn't match what certbot sees.

# Reload Nginx to ensure config is active
systemctl reload nginx

# Ensure site is enabled (though we write to sites-available/default)
if [ ! -f /etc/nginx/sites-enabled/default ]; then
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
fi
systemctl restart nginx

# Try to obtain certificate
# We add --reinstall to force update if needed
# If certbot fails to install, we try to just install the certificate if it exists
if ! certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
    echo "Certbot failed to obtain/install certificate. Attempting to install existing certificate..."
    certbot install --cert-name $DOMAIN
fi


echo "--------------------------------------------------"
echo "Deployment Complete!"
echo "Visit https://$DOMAIN to see your website."
echo "--------------------------------------------------"
