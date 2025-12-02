# Daily Dubai Lottery Application

This is a full-stack lottery application with a React frontend and an Express.js backend. This guide provides instructions for deploying the application.

## Deployment Architectures

There are two recommended ways to deploy this application:

1.  **All-in-One VPS:** Simple to set up, with both the frontend and backend running on a single server.
2.  **Jamstack with Cloudflare Pages (Recommended):** A modern, high-performance setup where the frontend is deployed to Cloudflare's global edge network, and the backend runs on a separate VPS. This provides superior speed, scalability, and security.

---

## Deployment Option 1: All-in-One VPS

Follow these steps to get your application running in a production environment on a single Linux-based VPS.

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

The React frontend needs to be compiled into static files. Before running the build, create a `.env` file in the project's root directory to hold your environment variables.

```bash
# In the project's root directory
nano .env
```

Paste the following into the file, replacing the placeholder with your actual Gemini API key.

```env
# This key is for frontend AI features
VITE_GEMINI_API_KEY=your_google_api_key_here
```

Now, install dependencies and run the build script.

```bash
# Install all frontend dependencies
npm install

# Run the build script
npm run build
```

This will create a `dist` directory containing the optimized frontend application.

### 4. Set Up the Backend

Follow the detailed instructions in the [backend/README.md](./backend/README.md) file to set up the database, configure the backend `.env` file, and seed the database.

### 5. Start the Application with PM2

From the project's **root directory**, start the application using PM2.

```bash
# Go back to the root of your project
cd ..

# Start the application
pm2 start ecosystem.config.js
```

### 6. Configure Nginx

Configure Nginx as a reverse proxy to make your application accessible on port 80/443. Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Paste the following configuration, replacing `yourdomain.com` with your actual domain.

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site, test the configuration, and restart Nginx.
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Finally, secure your site with an SSL certificate using Certbot.
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Deployment Option 2: Jamstack with Cloudflare Pages (Recommended)

This architecture separates the frontend (on Cloudflare) and the backend (on your VPS).

### Part A: Deploying the Backend to Your VPS

1.  Follow **all the steps** in the [backend/README.md](./backend/README.md) file to get your backend running on your VPS, served by PM2.
2.  Configure Nginx on your VPS to act as a reverse proxy for your backend, ideally on a subdomain like `api.yourdomain.com`.
3.  Secure your API endpoint with an SSL certificate using Certbot.
4.  Ensure your backend has CORS enabled. The default `cors()` middleware in `server.js` is permissive and should work. For better security, you can restrict it to your Cloudflare domain: `app.use(cors({ origin: 'https://your-cloudflare-app.pages.dev' }));`.

### Part B: Deploying the Frontend to Cloudflare Pages

1.  **Push your code to GitHub:** Make sure your repository is up to date.
2.  **Create a new Cloudflare Pages project:**
    -   Log in to your Cloudflare dashboard.
    -   Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    -   Select your project repository.
3.  **Configure the build settings:**
    -   **Project name:** Choose a name for your site.
    -   **Production branch:** Select `main` (or your primary branch).
    -   **Framework preset:** Select `Vite`.
    -   **Build command:** `npm run build`
    -   **Build output directory:** `dist`
4.  **Add Environment Variables:**
    -   Go to **Settings** > **Environment variables**.
    -   Add the following variables for your **Production** environment:
        -   `VITE_API_BASE_URL`: The full URL to your backend API on the VPS (e.g., `https://api.yourdomain.com`).
        -   `VITE_GEMINI_API_KEY`: Your Google Gemini API key.
5.  **Save and Deploy:** Click "Save and Deploy". Cloudflare will now build and deploy your frontend.

Your application is now live on Cloudflare's global network, with the frontend automatically calling your secure backend API.

### Local Development for Jamstack

To run this setup locally:
1.  Create a `.env` file in the project root.
2.  Add your `VITE_GEMINI_API_KEY`.
3.  Leave `VITE_API_BASE_URL` empty.
4.  Run your backend server from the `backend` directory (`npm run dev`).
5.  Run your frontend server from the root directory (`npm run dev`).

The Vite development server is pre-configured with a proxy that will automatically forward API requests from `/api` to your local backend on port 5000, avoiding CORS issues.
