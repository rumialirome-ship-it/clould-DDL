# Daily Dubai Lottery Application

This is a full-stack lottery application with a React frontend and an Express.js backend. This guide provides instructions for deploying the application to a Virtual Private Server (VPS).

## Deployment to VPS

Follow these steps to get your application running in a production environment on a Linux-based VPS.

### 1. Prerequisites on the VPS

Ensure you have the following software installed on your server.

-   **Git:** For cloning the repository.
-   **Node.js & npm:** (Version 16.x or newer is recommended).
-   **PM2:** A process manager for Node.js to keep your application running.
    ```bash
    npm install pm2 -g
    ```
-   **Nginx:** A web server and reverse proxy.
    ```bash
    sudo apt update
    sudo apt install nginx
    ```
-   **MySQL Server:** The database for the application.
    ```bash
    sudo apt update
    sudo apt install mysql-server
    sudo mysql_secure_installation
    ```

### 2. Clone the Repository

Clone your project's source code onto the VPS.

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### 3. Build the Frontend

The React frontend needs to be compiled into static HTML, CSS, and JavaScript files. Before running the build, you must make the Gemini API key available as an environment variable.

```bash
# Install all frontend dependencies
npm install

# Run the build script, providing your API key
# You can get your key from Google AI Studio
API_KEY=AIzaSyCF0j0LFCwPdpz30sdfiyEHG44qlLIGW1Q npm run build
```

This command will create a `dist` directory in your project root, containing the optimized frontend application with the API key embedded.

### 4. Set Up the Backend Application

Navigate to the backend directory and install its dependencies first. This is a crucial step before running any backend scripts.

```bash
# From your project's root directory, navigate to the backend
cd backend

# Install all backend dependencies
npm install
```

### 5. Set Up the Backend Database

First, create the database itself.

```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mydb;"
```

Now, use the following **single commands** to create the application user and set its password. Replace `'Imranali@Guru1'` if you chose a different password, but ensure it matches what you will use in the next steps.

These commands are safe to run multiple times. They will create the user if it doesn't exist and guarantee the password is set correctly every time.

```bash
# Command to create the user (if it doesn't exist)
sudo mysql -e "CREATE USER IF NOT EXISTS 'ddl_user'@'localhost' IDENTIFIED BY 'Imranali@Guru1';"

# Command to guarantee the password is correct (CRITICAL STEP)
sudo mysql -e "ALTER USER 'ddl_user'@'localhost' IDENTIFIED BY 'Imranali@Guru1';"

# Command to grant permissions
sudo mysql -e "GRANT ALL PRIVILEGES ON mydb.* TO 'ddl_user'@'localhost';"

# Command to apply all changes
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 6. Configure Backend Environment (`.env` file)

Your backend application needs a way to connect to the database and use other services. This is configured using an environment file. Create a `.env` file inside the `backend` directory.

**This file is the single source of truth for all your secret keys.** It is used by manual scripts (like `db:seed`) and is loaded by the main application when it starts with PM2.

```bash
# Make sure you are inside the 'backend' directory
nano .env
```

Paste the following content into the file. The password should match the one you set in the previous step. **This file must not be committed to Git.**

```env
# --- Main Backend Configuration ---

# Backend Server Port
PORT=5000

# JSON Web Token Secret - IMPORTANT: Use a long, random string.
# Generate with: openssl rand -base64 32
JWT_SECRET=your_super_strong_and_secret_jwt_key_here

# Google Gemini API Key (For AI analysis features)
API_KEY=AIzaSyCF0j0LFCwPdpz30sdfiyEHG44qlLIGW1Q

# --- MySQL Database Connection ---
# Use 127.0.0.1 for the host to avoid potential network issues with 'localhost'.
# Use the database credentials you created in Step 5.

DB_HOST=127.0.0.1
DB_USER=ddl_user
DB_PASSWORD=Imranali@Guru1
DB_DATABASE=mydb
```

Save the file (in `nano`, press `CTRL+X`, then `Y`, then `Enter`).

#### 6.1 Run the Seed Script

Now that the `.env` file exists, you can run the seed script successfully to set up your database tables.

```bash
# This assumes you are already in the 'backend' directory
# This command will create tables and seed/reset initial data
npm run db:seed
```

This command is **safe to run multiple times**. It performs the following actions:
1.  **Creates Schema:** Creates all required tables (`admins`, `clients`, `draws`, `bets`, `transactions`) if they don't already exist.
2.  **Updates/Seeds Draws:** Resets the draw schedule for the current day by removing any `UPCOMING` draws and inserting a fresh schedule.
3.  **Seeds/Resets Users:** Ensures the default admin and client users exist and **resets their passwords to the default values**. If you are ever locked out or can't log in with the default credentials, run this command again to fix it.

**Note:** As of the latest update, the application will **automatically create the schedule for each new day** upon the first request after the daily reset time (11 AM PKT). This seed script is now primarily for initial setup or for manually resetting a day's draw schedule if needed.

This process ensures the following accounts are available:
-   An **admin** user with username `01` and password `password`.
-   A **client** user with Client ID `02`, username `Sample Client`, and password `password`.

**Security Warning:** You should log in and change these default passwords immediately.

### 7. Start the Application with PM2

From the project's root directory, start the application using PM2. The `ecosystem.config.js` is configured to automatically use the secrets from your `backend/.env` file.

```bash
# Go back to the root of your project
cd ..

# Start the application
pm2 start ecosystem.config.js
```

Your application is now running.

### 8. Configure Nginx and Secure with SSL

This step is unchanged. Configure Nginx to act as a reverse proxy for your application running on port 5000 and secure it with an SSL certificate.

### 9. Managing the Application

Here are some useful PM2 commands:

-   **List running processes:** `pm2 list`
-   **View real-time logs:** `pm2 logs ddl-backend`
-   **Restart the application:** `pm2 restart ddl-backend`
-   **Stop the application:** `pm2 stop ddl-backend`
-   **Save the process list to restart on server reboot:** `pm2 save`

### 10. Troubleshooting

#### Problem: MySQL Service Fails to Start

-   **Symptoms:** When you run `sudo systemctl start mysql` or `sudo systemctl status mysql`, you see an error like `Active: failed (Result: exit-code)` or `Job for mysql.service failed`.
-   **Root Cause:** The MySQL installation on your server is corrupted or has broken configuration files preventing the service from starting. This can happen after a partial or failed installation attempt.
-   **Solution:** Perform a complete and aggressive purge of all MySQL-related packages and files, then reinstall. This ensures a truly clean slate.
    1.  **Stop the service and purge everything:**
        ```bash
        sudo systemctl stop mysql
        sudo apt-get remove --purge mysql-*
        sudo rm -rf /etc/mysql /var/lib/mysql
        sudo apt-get autoremove
        sudo apt-get autoclean
        ```
    2.  **Reinstall a fresh copy:**
        ```bash
        sudo apt-get update
        sudo apt-get install mysql-server
        ```
    3.  **Verify it's running:**
        ```bash
        sudo systemctl status mysql
        # You should see a green "active (running)" message.
        ```
    4.  If it is running, proceed with `sudo mysql_secure_installation` and the rest of the database setup steps.

#### Problem: Application fails to start or scripts fail with "Access Denied"

-   **Symptom:** You see an error message like `Error: Access denied for user ''@'localhost' (using password: NO)`.
-   **Root Cause:** There is a mismatch between the credentials in your `backend/.env` file and the credentials in the MySQL database.
-   **Solution Checklist:**
    1.  **Check `backend/.env`:** Ensure it exists, is correctly named, and that `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` are correct.
    2.  **Verify MySQL Password:** Guarantee the password in MySQL is what you think it is by running: `sudo mysql -e "ALTER USER 'ddl_user'@'localhost' IDENTIFIED BY 'your_strong_password';"`.
    3.  **Restart PM2:** You **must** run `pm2 restart ddl-backend` after changing the `.env` file.


#### Problem: Admin login fails with "Invalid credentials"

-   **Cause:** The password stored in the database for the admin user (`01`) is incorrect.
-   **Solution:** A dedicated script is provided to safely reset the admin password back to the default (`password`).
    1.  Ensure your `backend/.env` file is correct.
    2.  From the `backend` directory, run: `npm run admin:reset-password`.
    3.  Try logging in again with username `01` and password `password`.