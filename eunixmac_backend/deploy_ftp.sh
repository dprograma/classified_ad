#!/bin/bash

# FTP Deployment Script for Laravel Backend
# This script uses lftp for deployment. Ensure lftp is installed on your system.
# For security, it prompts for the FTP password and does not store it.

# --- Configuration --- START
FTP_HOST="ftp.eunixma.com.ng" # e.g., ftp.yourdomain.com or yourdomain.com
FTP_USER="eunixmac" # Your cPanel FTP username

# Remote paths on your cPanel server
# This is the directory where your main Laravel application files will reside (outside public_html)
REMOTE_APP_DIR="/home/eunixmac/eunixmac_api" # e.g., /home/username/laravel_app

# This is the directory where your public assets will go (usually public_html)
REMOTE_PUBLIC_DIR="/home/eunixmac/public_html" # e.g., /home/username/public_html

# Local paths (relative to where this script is run)
LOCAL_APP_DIR="." # Current directory (eunixmac_backend)
LOCAL_PUBLIC_DIR="./public" # The public directory within your Laravel app

# Exclude list for the main application files (relative to LOCAL_APP_DIR)
# Add any files/folders you don't want to upload (e.g., local dev files, node_modules, .git)
EXCLUDES=(
    ".git/"
    "node_modules/"
    "vendor/" # Composer dependencies should be installed on the server if possible
    ".env" # Your production .env should be configured directly on the server
    "public/" # Public directory is handled separately
    "storage/" # Storage contents are usually generated or managed on the server
    "bootstrap/cache/" # Cache files are generated on the server
    "deploy_ftp.sh" # Don't upload the script itself
    "composer.lock"
    "package.json"
    "package-lock.json"
    "webpack.mix.js"
    "phpunit.xml"
    "README.md"
    ".editorconfig"
    ".gitattributes"
    ".styleci.yml"
    "server.php"
)

# --- Configuration --- END

# --- Pre-deployment Checks ---

# Ensure lftp is installed
if ! command -v lftp &> /dev/null
then
    echo "lftp could not be found. Please install lftp to use this script (e.g., sudo apt-get install lftp on Debian/Ubuntu, brew install lftp on macOS)."
    exit 1
fi

# --- Get FTP Password Securely ---
read -s -p "Enter FTP Password for $FTP_USER@$FTP_HOST: " FTP_PASS
echo

# --- Deployment Logic ---

echo "\n--- Deploying Main Application Files to $REMOTE_APP_DIR ---"
lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" -e "set ftp:ssl-allow no; mirror -R --delete-first --verbose --exclude-glob ${EXCLUDES[@]} $LOCAL_APP_DIR $REMOTE_APP_DIR; bye"

if [ $? -eq 0 ]; then
    echo "Main application files deployed successfully."
else
    echo "Error deploying main application files. Exiting."
    exit 1
fi

echo "\n--- Deploying Public Directory Contents to $REMOTE_PUBLIC_DIR ---"
lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" -e "set ftp:ssl-allow no; mirror -R --delete-first --verbose $LOCAL_PUBLIC_DIR $REMOTE_PUBLIC_DIR; bye"

if [ $? -eq 0 ]; then
    echo "Public directory contents deployed successfully."
else
    echo "Error deploying public directory contents. Exiting."
    exit 1
fi

echo "\n--- Deployment Complete ---"
echo "Remember to perform post-deployment steps on your server (e.g., via SSH or cPanel Terminal):"
echo "  1. Update .env file with production database credentials and APP_URL."
echo "  2. Run 'php artisan migrate' (if database changes)."
echo "  3. Run 'php artisan config:clear' and 'php artisan cache:clear'."
echo "  4. Set correct file permissions (storage and bootstrap/cache to 775 or 777)."

# Clear password from memory (best effort)
unset FTP_PASS
