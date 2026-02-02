<?php
/**
 * Web-based Migration Runner for cPanel Deployment
 * SECURITY WARNING: DELETE THIS FILE AFTER RUNNING MIGRATIONS!
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CPANEL PATH CONFIGURATION
$laravelRoot = '/home/eunixmac/eunixmac_api';

define('MIGRATION_PASSWORD', 'eunixmacsecretpassword');
define('REQUIRE_PASSWORD', true);

// Start HTML output first
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Migration Runner</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .warning strong { color: #856404; display: block; margin-bottom: 5px; }
        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            color: #721c24;
        }
        .info {
            background: #d1ecf1;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            color: #0c5460;
        }
        .code {
            background: #f4f4f4;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            overflow-x: auto;
        }
        .migration-list {
            list-style: none;
            margin: 15px 0;
        }
        .migration-list li {
            padding: 10px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .migration-list li:last-child { border-bottom: none; }
        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success { background: #28a745; color: white; }
        .badge-pending { background: #ffc107; color: #333; }
        form { margin: 20px 0; }
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 10px;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
        }
        .step { margin: 20px 0; }
        .step-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Database Migration Runner</h1>
            <p>Books Commission & Withdrawal System</p>
        </div>
        <div class="content">

<?php

// Verify paths exist
if (!file_exists($laravelRoot)) {
    ?>
    <div class="error">
        <strong>❌ Laravel root directory not found</strong>
        <p>Path: <code><?php echo htmlspecialchars($laravelRoot); ?></code></p>
        <p>Please update the $laravelRoot variable in this file.</p>
    </div>
    <?php
    goto end;
}

if (!file_exists($laravelRoot . '/vendor/autoload.php')) {
    ?>
    <div class="error">
        <strong>❌ Composer not installed</strong>
        <p>vendor/autoload.php not found in: <code><?php echo htmlspecialchars($laravelRoot); ?></code></p>
        <p>Run <code>composer install</code> in your Laravel directory first.</p>
    </div>
    <?php
    goto end;
}

if (!file_exists($laravelRoot . '/bootstrap/app.php')) {
    ?>
    <div class="error">
        <strong>❌ Laravel bootstrap file not found</strong>
        <p>bootstrap/app.php not found in: <code><?php echo htmlspecialchars($laravelRoot); ?></code></p>
    </div>
    <?php
    goto end;
}

// Change to Laravel root directory
chdir($laravelRoot);

// Bootstrap Laravel
try {
    require $laravelRoot . '/vendor/autoload.php';
    $app = require_once $laravelRoot . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
} catch (Exception $e) {
    ?>
    <div class="error">
        <strong>❌ Failed to load Laravel</strong>
        <p><strong>Error:</strong> <?php echo htmlspecialchars($e->getMessage()); ?></p>
        <p><strong>File:</strong> <?php echo htmlspecialchars($e->getFile()); ?></p>
        <p><strong>Line:</strong> <?php echo $e->getLine(); ?></p>
        <details>
            <summary>Stack Trace</summary>
            <pre><?php echo htmlspecialchars($e->getTraceAsString()); ?></pre>
        </details>
    </div>
    <?php
    goto end;
}

// Password Check
if (REQUIRE_PASSWORD) {
    $passwordSubmitted = $_POST['password'] ?? '';

    if (empty($passwordSubmitted)) {
        ?>
        <div class="warning">
            <strong>⚠️ Authentication Required</strong>
            This migration script is password protected.
        </div>

        <form method="POST">
            <input type="password" name="password" placeholder="Enter migration password" required autofocus>
            <button type="submit">🔓 Unlock & View Migrations</button>
        </form>

        <div class="info">
            <strong>📝 Password:</strong> <code>eunixmacsecretpassword</code>
        </div>
        <?php
        goto end;
    }

    if ($passwordSubmitted !== MIGRATION_PASSWORD) {
        ?>
        <div class="error">
            <strong>❌ Incorrect Password</strong>
            Please try again.
        </div>

        <form method="POST">
            <input type="password" name="password" placeholder="Enter migration password" required autofocus>
            <button type="submit">🔓 Unlock</button>
        </form>
        <?php
        goto end;
    }
}

?>

<div class="warning">
    <strong>⚠️ SECURITY WARNING</strong>
    <p>DELETE THIS FILE after running migrations!</p>
</div>

<?php

$action = $_POST['action'] ?? 'status';

try {
    // Test database connection
    $db = DB::connection();
    $db->getPdo();

    ?>
    <div class="success">✅ Database connected!</div>
    <?php

    // Check migrations table
    if (!DB::getSchemaBuilder()->hasTable('migrations')) {
        ?>
        <div class="error">
            <strong>❌ Migrations table not found</strong>
            <p>Run this SQL in phpMyAdmin first:</p>
            <div class="code">CREATE TABLE migrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL
);</div>
        </div>
        <?php
        goto end;
    }

    // Get migrations
    $migrationPath = $laravelRoot . '/database/migrations';
    $files = glob($migrationPath . '/*.php');

    if (empty($files)) {
        ?>
        <div class="error">
            <strong>❌ No migration files found</strong>
            <p>Looking in: <code><?php echo htmlspecialchars($migrationPath); ?></code></p>
        </div>
        <?php
        goto end;
    }

    $ranMigrations = DB::table('migrations')->pluck('migration')->toArray();

    // Filter Books Commission migrations (2026_01_23)
    $booksMigrations = array_filter($files, function($file) {
        return strpos(basename($file), '2026_01_23') !== false;
    });

    if (empty($booksMigrations)) {
        ?>
        <div class="error">
            <strong>❌ No Books Commission migrations found</strong>
            <p>Looking for files starting with '2026_01_23' in: <code><?php echo htmlspecialchars($migrationPath); ?></code></p>
        </div>
        <?php
        goto end;
    }

    $allMigrations = [];
    $pendingMigrations = [];

    foreach ($booksMigrations as $file) {
        $filename = basename($file, '.php');
        $status = in_array($filename, $ranMigrations) ? 'ran' : 'pending';

        $allMigrations[] = [
            'file' => $filename,
            'status' => $status,
            'path' => $file
        ];

        if ($status === 'pending') {
            $pendingMigrations[] = [
                'file' => $filename,
                'path' => $file
            ];
        }
    }

    ?>
    <div class="step">
        <div class="step-title">📊 Migration Status</div>
        <div class="info">
            <strong>Found:</strong> <?php echo count($allMigrations); ?> migrations<br>
            <strong>Pending:</strong> <?php echo count($pendingMigrations); ?> migrations
        </div>

        <ul class="migration-list">
            <?php foreach ($allMigrations as $m): ?>
                <li>
                    <span><?php echo htmlspecialchars($m['file']); ?></span>
                    <span class="badge badge-<?php echo $m['status'] === 'ran' ? 'success' : 'pending'; ?>">
                        <?php echo strtoupper($m['status']); ?>
                    </span>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>

    <?php

    // Run migrations
    if ($action === 'run_migrations' && count($pendingMigrations) > 0) {
        ?>
        <div class="step">
            <div class="step-title">🚀 Running Migrations...</div>
        <?php

        $allSuccess = true;

        foreach ($pendingMigrations as $migration) {
            try {
                echo "<div class='info'><strong>Running:</strong> {$migration['file']}</div>";
                flush();

                // Load the migration file - it returns an anonymous class instance
                $migrationInstance = require $migration['path'];

                // Check if it's a valid migration instance
                if (!is_object($migrationInstance) || !method_exists($migrationInstance, 'up')) {
                    throw new Exception("Invalid migration file - must return a Migration class instance");
                }

                // Run migration
                $migrationInstance->up();

                // Record in database
                DB::table('migrations')->insert([
                    'migration' => $migration['file'],
                    'batch' => (DB::table('migrations')->max('batch') ?? 0) + 1
                ]);

                echo "<div class='success'>✅ Success: {$migration['file']}</div>";
                flush();

            } catch (Exception $e) {
                $allSuccess = false;
                echo "<div class='error'><strong>❌ Failed:</strong> {$migration['file']}<br>";
                echo "<strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "<br>";
                echo "<strong>File:</strong> " . htmlspecialchars($e->getFile()) . "<br>";
                echo "<strong>Line:</strong> " . $e->getLine() . "</div>";
                flush();
            }
        }

        echo "</div>";

        if ($allSuccess) {
            ?>
            <div class="success">
                <strong>🎉 All migrations completed successfully!</strong>
                <p>The Books Commission & Withdrawal System is now ready.</p>
                <p><strong>⚠️ DELETE THIS FILE NOW for security!</strong></p>
            </div>
            <?php
        } else {
            ?>
            <div class="error">
                <strong>⚠️ Some migrations failed</strong>
                <p>Please fix the errors above and try again.</p>
            </div>
            <?php
        }

    } elseif (count($pendingMigrations) > 0) {
        ?>
        <div class="step">
            <div class="step-title">⚡ Ready to Run</div>
            <div class="info">
                <strong>What will happen:</strong>
                <ul style="margin-left: 20px; margin-top: 10px; line-height: 1.8;">
                    <li>✅ Rename "Educational Material" category to "Books"</li>
                    <li>✅ Create <code>bank_accounts</code> table</li>
                    <li>✅ Add commission fields to <code>payments</code> table</li>
                    <li>✅ Update <code>withdrawals</code> table structure</li>
                </ul>
            </div>

            <div class="warning">
                <strong>⚠️ Before Running:</strong>
                <p>Make sure you have a database backup! This will modify your database.</p>
            </div>

            <form method="POST">
                <input type="hidden" name="password" value="<?php echo htmlspecialchars($_POST['password'] ?? ''); ?>">
                <input type="hidden" name="action" value="run_migrations">
                <button type="submit">🚀 Run Migrations Now</button>
            </form>
        </div>
        <?php

    } else {
        ?>
        <div class="success">
            <strong>✅ All migrations are up to date!</strong>
            <p>No pending migrations for the Books Commission System.</p>
            <p><strong>DELETE THIS FILE NOW!</strong></p>
        </div>
        <?php
    }

} catch (Exception $e) {
    ?>
    <div class="error">
        <strong>❌ Database Error:</strong> <?php echo htmlspecialchars($e->getMessage()); ?>
        <details>
            <summary>Full Error Details</summary>
            <p><strong>File:</strong> <?php echo htmlspecialchars($e->getFile()); ?></p>
            <p><strong>Line:</strong> <?php echo $e->getLine(); ?></p>
            <pre><?php echo htmlspecialchars($e->getTraceAsString()); ?></pre>
        </details>
    </div>
    <?php
}

end:
?>

        </div>
        <div class="footer">
            <strong>Books Commission & Withdrawal System</strong><br>
            Migration Runner v1.0 | Remember to delete this file after use!
        </div>
    </div>
</body>
</html>
