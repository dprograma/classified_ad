 # Deploying from GitHub to Production

This document outlines methods for deploying your application from a GitHub repository to a production server.

**⚠️ Security Warning:** It is **strongly discouraged** to use standard FTP for deployment. FTP is an insecure protocol that transmits credentials (username and password) in plain text. This poses a significant security risk to your server. The recommended approach is to use a secure alternative like **SFTP** or **SSH with `git`**.

---

## Recommended Method: Automated Deployment with GitHub Actions and SFTP

This is the modern, secure, and reliable way to deploy your application. The process is automated: when you push code to your `main` branch on GitHub, it will automatically be built and deployed to your server.

This example assumes your server supports **SFTP (Secure File Transfer Protocol)**.

### Prerequisites

1.  **SFTP/SSH Credentials:** You need the hostname, username, and password for your production server.
2.  **GitHub Repository:** Your code must be in a GitHub repository.

### Step 1: Configure GitHub Secrets

Never hardcode your server credentials in your code. Use GitHub's encrypted secrets.

1.  In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**.
2.  Click **New repository secret** for each of the following:
    *   `FTP_SERVER`: Your server's hostname or IP address (e.g., `sftp.yourdomain.com`).
    *   `FTP_USERNAME`: Your SFTP/SSH username.
    *   `FTP_PASSWORD`: Your SFTP/SSH password.

### Step 2: Create the GitHub Actions Workflow

1.  Create a new directory path in your repository: `.github/workflows/`.
2.  Inside that directory, create a new file named `deploy.yml`.
3.  Add the following content to `deploy.yml`:

```yaml
name: Build and Deploy to Production

# Trigger the workflow on a push to the main branch
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    # --- Backend Setup (Laravel) ---
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1' # Match your project's PHP version

    - name: Install Composer Dependencies
      working-directory: ./backend
      run: composer install --no-dev --optimize-autoloader

    # --- Frontend Setup (React/Vite) ---
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18' # Match your project's Node version

    - name: Install NPM Dependencies
      working-directory: ./frontend
      run: npm install

    - name: Build Frontend Assets
      working-directory: ./frontend
      run: npm run build

    # --- Deploy Files via SFTP ---
    - name: Deploy Backend Files
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        protocol: sftp
        port: 22
        local-dir: ./backend/
        server-dir: /path/to/your/backend/ # IMPORTANT: Use the FULL, ABSOLUTE path on your server.
        exclude: |
          **/.git*
          **/.git*/**
          **/node_modules/**
          .github/**
          storage/logs/*
          .env

    - name: Deploy Frontend Files
      uses: SamKirkland/FTP-Deploy-Action@4.3.3
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        protocol: sftp
        port: 22
        local-dir: ./frontend/dist/ # Deploy the build output
        server-dir: /path/to/your/frontend/ # IMPORTANT: Use the FULL, ABSOLUTE path (e.g., /home/your-user/public_html/)

```

### How It Works

*   **`on: push: branches: [main]`**: This workflow runs every time you `git push` to the `main` branch.
*   **`Checkout Code`**: It downloads your repository's code into the runner environment.
*   **`Setup PHP` & `Install Composer`**: It sets up the PHP environment and installs your backend dependencies.
*   **`Setup Node.js`, `Install NPM`, `Build Frontend`**: It sets up Node.js, installs frontend dependencies, and runs `npm run build` to create the optimized production assets in `frontend/dist`.
*   **`Deploy Backend Files`**: It securely transfers only the backend files to the specified `server-dir`.
*   **`Deploy Frontend Files`**: It securely transfers the contents of the `frontend/dist` directory to your web server's root.

---

## Manual Method: Using an FTP Client (Not Recommended)

This method is manual, slow, and insecure. Use it only if you have no other choice.

### Prerequisites

1.  **FTP Client:** Install an FTP client like [FileZilla](https://filezilla-project.org/) or [Cyberduck](https://cyberduck.io/).
2.  **FTP Credentials:** Your server's hostname, username, and password.

### Steps

1.  **Pull Latest Code:** On your local machine, make sure you have the latest version of your code.
    ```bash
    git pull origin main
    ```

2.  **Install Dependencies & Build Assets:** You must build the production-ready files locally *before* uploading.
    
    **Backend:**
    ```bash
    cd backend
    composer install --no-dev --optimize-autoloader
    cd ..
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run build
    ```
    This will create a `dist` folder inside your `frontend` directory. This `dist` folder contains the optimized HTML, CSS, and JavaScript for your frontend.

3.  **Connect to FTP Server:**
    *   Open your FTP client.
    *   Enter the Host, Username, and Password to connect to your server.

4.  **Upload Files:**
    *   Navigate to your project directory on your local machine (left panel in FileZilla).
    *   Navigate to the destination directories on your server (right panel).
    *   **Carefully** drag and drop the files and folders from your local machine to the server.

    **What to Upload:**

    *   **Backend:** Upload the contents of the `backend` directory to your server's backend directory.
        *   **EXCEPT** for the `.env` file (which should be configured separately on the server) and `storage/logs`.

    *   **Frontend:** Upload the **contents** of the `frontend/dist` directory to your server's public web root (e.g., `public_html`, `www`).

    **What NOT to Upload:**
    *   `.git` directory and `.github` directory
    *   `node_modules` directory (from both root and `frontend`)
    *   `.gitignore`, `README.md`, etc.
    *   Local development files.
