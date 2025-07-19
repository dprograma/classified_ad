
### Architectural Design Document: Classified Ads Platform

#### 1. **Introduction and Overview**

This document outlines the complete architectural design for the Classified Ads Platform. The architecture is designed to be robust, scalable, and maintainable, following modern best practices while adhering to the specified technology stack. The platform is a web-based application with a decoupled frontend and backend, communicating via a RESTful API.

#### 2. **Technology Stack**

The technology stack is chosen to optimize for developer productivity, performance, and scalability, based on the project requirements.

*   **Backend:** PHP 8.x with the **Laravel 10.x** framework. Laravel is selected for its robust features, security, and rapid development capabilities.
*   **Frontend:** **React.js 18.x** with **Material-UI (MUI) 5.x**. This combination provides a modern, responsive, and component-based UI.
*   **Database:** **PostgreSQL 14.x**. A powerful, open-source object-relational database system known for its reliability and data integrity.
*   **Web Server:** **Apache** (as commonly provided with cPanel).
*   **Payment Gateway:** **Paystack** for all payment processing.
*   **Email Service:** **Mailtrap.io** for development and a transactional email service like **SendGrid** or **Amazon SES** for production.

#### 3. **Platform Architecture**

The architecture is a classic **decoupled client-server model**.

*   **Backend (API):** A monolithic Laravel application that serves as a RESTful API. It handles all business logic, including user authentication, ad management, database interactions, and payment processing.
*   **Frontend (Client):** A single-page application (SPA) built with React.js. It is responsible for rendering the user interface and managing the user experience. It communicates with the backend via API calls to fetch and manipulate data.

This decoupled approach allows for independent development, deployment, and scaling of the frontend and backend.

#### 4. **Hosting Environment: cPanel Shared Hosting**

The application will be deployed on a cPanel-based shared hosting environment (e.g., Whogohost.com).

**Setup and Configuration:**

1.  **Domain and SSL:** The domain will be pointed to the hosting provider's nameservers, and a free Let's Encrypt SSL certificate will be installed via the cPanel interface to enable HTTPS.
2.  **Database Setup:** A new PostgreSQL database and user will be created using the cPanel "PostgreSQL Databases" wizard.
3.  **PHP Version:** The PHP version will be set to 8.1 or higher from the "MultiPHP Manager" in cPanel.
4.  **File Structure:**
    *   The Laravel backend code will be placed in a directory outside of `public_html` (e.g., `/home/user/laravel_app`).
    *   The contents of the Laravel `public` directory will be moved to `public_html`.
    *   The `index.php` file in `public_html` will be updated to correctly reference the `vendor` and `bootstrap` directories in the `laravel_app` folder.
    *   The React frontend will be built into a static bundle (`npm run build`) and the contents of the `build` directory will be placed in a subdirectory within `public_html` (e.g., `public_html/app`).

#### 5. **API Endpoint Design**

The API will be versioned (e.g., `/api/v1/...`) to allow for future updates without breaking the frontend.

**Authentication (using Laravel Sanctum)**

*   `POST /api/v1/register`: Register a new user.
*   `POST /api/v1/login`: Log in a user and receive an API token.
*   `POST /api/v1/logout`: Log out the user (requires authentication).

**Categories**

*   `GET /api/v1/categories`: Get all primary categories.
*   `GET /api/v1/categories/{id}/subcategories`: Get subcategories for a given category.

**Ads**

*   `GET /api/v1/ads`: Get a list of all ads (with filtering and pagination).
*   `GET /api/v1/ads/{id}`: Get details for a single ad.
*   `POST /api/v1/ads`: Create a new ad (requires authentication).
*   `PUT /api/v1/ads/{id}`: Update an existing ad (requires authentication).
*   `DELETE /api/v1/ads/{id}`: Delete an ad (requires authentication).

**Payments (Ad Boosting)**

*   `POST /api/v1/ads/{id}/boost`: Initiate the payment process for boosting an ad.
*   `GET /api/v1/payments/verify`: Verify a payment with Paystack.

**User Management**

*   `GET /api/v1/user`: Get the authenticated user's profile.
*   `PUT /api/v1/user`: Update the authenticated user's profile.

**Admin**

*   `GET /api/v1/admin/ads`: Get all ads for admin review.
*   `PUT /api/v1/admin/ads/{id}/approve`: Approve an ad.
*   `GET /api/v1/admin/users`: Get all users.
*   `PUT /api/v1/admin/users/{id}/verify`: Verify a user.

#### 6. **Installation and Setup**

**Development Environment (Local)**

1.  **Install Composer:** The PHP dependency manager.
2.  **Install Node.js and npm:** For frontend development.
3.  **Install PostgreSQL:** The database server.
4.  **Clone the repository.**
5.  **Backend Setup:**
    *   Run `composer install` to install PHP dependencies.
    *   Create a `.env` file from `.env.example` and configure the database connection.
    *   Run `php artisan key:generate`.
    *   Run `php artisan migrate --seed` to create the database schema and seed initial data.
6.  **Frontend Setup:**
    *   Navigate to the `frontend` directory.
    *   Run `npm install` to install JavaScript dependencies.
    *   Run `npm start` to start the React development server.

**Production Deployment (cPanel)**

1.  **SSH Access:** Enable SSH access in cPanel.
2.  **Deploy Backend:**
    *   Upload the Laravel project files to the server (outside `public_html`).
    *   Run `composer install --no-dev -o`.
    *   Configure the `.env` file with production database credentials and app URL.
    *   Run `php artisan migrate --force`.
3.  **Deploy Frontend:**
    *   Run `npm run build` locally to create a production build.
    *   Upload the contents of the `build` folder to the appropriate directory in `public_html`.
4.  **Configure Web Server:** Ensure the web server's document root is set to `public_html` and that rewrite rules are in place for the Laravel `index.php` and the React SPA.
