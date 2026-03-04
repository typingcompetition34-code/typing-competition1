# Deployment Instructions

This guide explains how to deploy the Edunity Hub project to your Ubuntu VPS.

## Prerequisites

1.  **SSH Access**: You must be able to SSH into your server (`root@72.62.227.180`).
    *   If you use an SSH key, ensure it's loaded in your SSH agent or specify it in the `deploy.ps1` script (e.g., `ssh -i path/to/key ...`).
    *   If you use a password, you will be prompted to enter it during the deployment process.
2.  **PowerShell**: The deployment script `deploy.ps1` is designed for Windows PowerShell.

## Deployment Steps

1.  Open a PowerShell terminal in the project root directory (`d:\app`).
2.  Run the deployment script:
    ```powershell
    .\deploy.ps1
    ```
3.  Enter your server password when prompted (for `scp` and `ssh`).
4.  Wait for the script to complete. It will:
    *   Compress the project files.
    *   Upload them to the server.
    *   Install necessary dependencies (Node.js, Nginx, PM2, etc.) on the server.
    *   Build the frontend.
    *   Configure Nginx and SSL (via Certbot).
    *   Start the backend server.

## Post-Deployment

*   Visit `https://edunityhub.com` to verify the deployment.
*   If you encounter SSL issues, the script attempts to set up Certbot automatically. Ensure your domain DNS points to `72.62.227.180`.

## Troubleshooting

*   **Permission Denied**: If you get a permission error running the script, try running PowerShell as Administrator or check your SSH credentials.
*   **Timeout**: If the connection times out, check if your firewall allows SSH (port 22).
*   **Nginx Error**: Check `/var/log/nginx/error.log` on the server for details.
