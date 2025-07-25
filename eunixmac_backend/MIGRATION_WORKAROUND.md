# Running Laravel Migrations on cPanel Without SSH

This guide provides a workaround to run Laravel database migrations on a shared hosting cPanel environment where SSH access is not available. This method involves creating a temporary web route to trigger the Artisan `migrate` command.

**⚠️ IMPORTANT SECURITY WARNING:**
This method exposes a way to run Artisan commands via a web request. **You MUST delete this route immediately after you have successfully run your migrations.** Leaving this route in production is a significant security risk.

## Steps:

1.  **Access Your Laravel Application Files:**
    Log in to your cPanel account and navigate to the "File Manager". Locate your Laravel application's `routes` directory (e.g., `/home/yourcpaneluser/laravel_app/routes/` or `/home/yourcpaneluser/public_html/routes/` depending on your deployment setup).

2.  **Edit `web.php`:**
    Open the `web.php` file for editing. This file is typically located at `your_app_root/routes/web.php`.

3.  **Add the Temporary Migration Route:**
    Add the following code snippet to the end of your `routes/web.php` file. Ensure you add `use Illuminate\Support\Facades\Artisan;` at the top of the file if it's not already there.

    ```php
    <?php

    use Illuminate\Support\Facades\Route;
    use Illuminate\Support\Facades\Artisan; // Add this line if not present

    // ... (your existing routes will be here)

    // TEMPORARY ROUTE FOR MIGRATIONS - DELETE IMMEDIATELY AFTER USE!
    Route::get('/run-migrations', function () {
        try {
            Artisan::call('migrate', ['--force' => true]);
            return 'Migrations executed successfully!';
        } catch (\Exception $e) {
            return 'Error running migrations: ' . $e->getMessage();
        }
    });
    ```

    *   `Artisan::call('migrate', ['--force' => true]);` is the equivalent of running `php artisan migrate --force`.
    *   The `--force` flag is crucial for running migrations in a production environment.
    *   The `try-catch` block will help you see any errors directly in your browser if the migration process encounters issues.

4.  **Save the `web.php` File:**
    Save the changes to the `web.php` file in your cPanel File Manager.

5.  **Trigger the Migrations:**
    Open your web browser and navigate to the following URL:

    `http://yourdomain.com/run-migrations`

    (Replace `yourdomain.com` with your actual domain name where your Laravel application is hosted).

    You should see a message in your browser indicating whether the migrations were executed successfully or if an error occurred.

6.  **CRITICAL: Delete the Temporary Route:**
    As soon as you confirm that the migrations have run successfully, go back to your `web.php` file in cPanel's File Manager and **immediately remove the entire `Route::get('/run-migrations', ...)` block you just added.**

    **Do NOT leave this route in your production application, as it poses a significant security vulnerability.**

By following these steps, you can effectively run your Laravel database migrations on shared hosting without direct SSH access.