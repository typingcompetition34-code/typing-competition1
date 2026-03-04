$ServerIP = "72.62.227.180"
$User = "root"
$DeployArchive = "deploy.tar.gz"
$RemoteDir = "/root/app"

Write-Host "Starting deployment to $User@$ServerIP..."

# 1. Clean up old archive
if (Test-Path $DeployArchive) {
    Remove-Item $DeployArchive
}

# 2. Create archive (excluding node_modules and unnecessary files)
# Write-Host "Creating archive..."
# tar -czvf $DeployArchive --exclude="node_modules" --exclude=".git" --exclude="dist" backend frontend setup-vps.sh package.json nginx_remote.conf

# 3. Copy archive to server (SKIPPED)
# Write-Host "Uploading archive to server..."
# scp $DeployArchive "${User}@${ServerIP}:/root/"

# 3b. Copy ONLY the updated setup script
Write-Host "Uploading updated setup script..."
scp setup-vps.sh "${User}@${ServerIP}:/root/app/"

# 4. Execute commands on server
Write-Host " executing setup on server..."
$RemoteCommands = "
    chmod +x $RemoteDir/setup-vps.sh;
    bash $RemoteDir/setup-vps.sh;
"

ssh "${User}@${ServerIP}" $RemoteCommands

Write-Host "Deployment script finished locally."
