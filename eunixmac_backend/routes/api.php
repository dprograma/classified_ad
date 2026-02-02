<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AdController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SocialLoginController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\AdminSupportController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\AffiliateController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:registration');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.send')->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect'])->middleware('throttle:social-login');
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback'])->middleware('throttle:social-login');

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/categories/{categoryId}/fields', [AdController::class, 'getCategoryFields']);
Route::get('/categories/{categoryId}/filters', [AdController::class, 'getCategoryFilters']);

// Newsletter subscription routes (public)
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);
Route::get('/newsletter/verify/{token}', [NewsletterController::class, 'verify']);

Route::get('/ads', [AdController::class, 'index']);
Route::get('/ads/search/suggestions', [AdController::class, 'getSearchSuggestions']);
Route::get('/ads/{ad}', [AdController::class, 'show']);

// Public news routes
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/latest', [NewsController::class, 'latest']);
Route::get('/news/search', [NewsController::class, 'search']);
Route::get('/news/{identifier}', [NewsController::class, 'show']);

Route::match(['get', 'post'], '/payments/verify', [PaymentController::class, 'verifyPayment']); // Public route for Paystack callback
Route::match(['get', 'post'], '/affiliate/verify-enrollment', [AffiliateController::class, 'verifyEnrollment']); // Public route for affiliate enrollment callback

Route::middleware('auth:sanctum')->group(function () {
    // Payment history routes
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/stats', [PaymentController::class, 'stats']);
    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'downloadReceipt']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('settings');
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/become-agent', [AuthController::class, 'becomeAgent']);
    Route::post('/user/become-affiliate', [AuthController::class, 'becomeAffiliate']);
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);

    // Affiliate routes
    Route::get('/affiliate/banks', [AffiliateController::class, 'getBanks']);
    Route::post('/affiliate/enroll', [AffiliateController::class, 'initiateEnrollment']);
    Route::get('/affiliate/dashboard', [AffiliateController::class, 'dashboard']);
    Route::post('/affiliate/bank-account', [AffiliateController::class, 'updateBankAccount']);
    Route::post('/affiliate/withdraw', [AffiliateController::class, 'requestWithdrawal']);
    Route::get('/affiliate/withdrawals', [AffiliateController::class, 'withdrawalHistory']);
    Route::get('/affiliate/commissions', [AffiliateController::class, 'commissionHistory']);
    Route::put('/user/settings', [AuthController::class, 'updateSettings']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

    // Bank account routes (New system)
    Route::prefix('bank-accounts')->group(function () {
        Route::get('/', [App\Http\Controllers\BankAccountController::class, 'index']);
        Route::get('/banks', [App\Http\Controllers\BankAccountController::class, 'getBanks']);
        Route::post('/verify', [App\Http\Controllers\BankAccountController::class, 'verifyAccount']);
        Route::post('/', [App\Http\Controllers\BankAccountController::class, 'store']);
        Route::put('/{id}/primary', [App\Http\Controllers\BankAccountController::class, 'setPrimary']);
        Route::delete('/{id}', [App\Http\Controllers\BankAccountController::class, 'destroy']);
    });

    // Withdrawal routes
    Route::prefix('withdrawals')->group(function () {
        Route::get('/', [App\Http\Controllers\WithdrawalController::class, 'index']);
        Route::get('/stats', [App\Http\Controllers\WithdrawalController::class, 'stats']);
        Route::post('/', [App\Http\Controllers\WithdrawalController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\WithdrawalController::class, 'show']);
        Route::post('/{id}/cancel', [App\Http\Controllers\WithdrawalController::class, 'cancel']);
    });

    // Old bank account routes (keep for backward compatibility)
    Route::get('/user/banks', [AuthController::class, 'getBanks']);
    Route::get('/user/bank-account', [AuthController::class, 'getBankAccount']);
    Route::post('/user/bank-account', [AuthController::class, 'updateBankAccount']);

    // Support routes
    Route::post('/support/contact', [SupportController::class, 'contact']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/ads', [AdController::class, 'store']);
    Route::put('/ads/{ad}', [AdController::class, 'update']);
    Route::delete('/ads/{ad}', [AdController::class, 'destroy']);

    Route::get('/ads/{ad}/messages', [MessageController::class, 'index']);
    Route::post('/ads/{ad}/messages', [MessageController::class, 'store']);
    Route::put('/conversations/{conversationId}/read', [MessageController::class, 'markAsRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{ad}', [BookController::class, 'show']);
    Route::post('/books/{ad}/pay', [BookController::class, 'initiatePayment']);
    Route::get('/books/{ad}/download', [BookController::class, 'download']);

    Route::middleware('can:agent')->group(function () {
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{ad}', [BookController::class, 'update']);
        Route::delete('/books/{ad}', [BookController::class, 'destroy']);
    });

    // Admin routes
    Route::middleware('can:admin')->group(function () {
        // Support ticket management
        Route::get('/admin/support/tickets', [AdminSupportController::class, 'index']);
        Route::get('/admin/support/tickets/{ticket}', [AdminSupportController::class, 'show']);
        Route::put('/admin/support/tickets/{ticket}', [AdminSupportController::class, 'update']);
        Route::post('/admin/support/tickets/{ticket}/responses', [AdminSupportController::class, 'addResponse']);
        Route::get('/admin/support/statistics', [AdminSupportController::class, 'statistics']);
        Route::post('/admin/support/tickets/bulk-assign', [AdminSupportController::class, 'bulkAssign']);
        Route::post('/admin/support/tickets/bulk-status', [AdminSupportController::class, 'bulkStatusUpdate']);
        Route::get('/admin/support/admin-users', [AdminSupportController::class, 'getAdminUsers']);

        // Category management - disabled until AdminController is implemented
        // Route::post('/categories', [CategoryController::class, 'store']);
        // Route::put('/categories/{category}', [CategoryController::class, 'update']);
        // Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // User and ad management
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::put('/admin/users/{user}/verify', [AdminController::class, 'verifyUser']);
        Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);

        Route::get('/admin/ads', [AdminController::class, 'getAds']);
        Route::put('/admin/ads/{ad}/approve', [AdminController::class, 'approveAd']);
        Route::put('/admin/ads/{ad}/reject', [AdminController::class, 'rejectAd']);
        Route::put('/admin/ads/{ad}/disapprove', [AdminController::class, 'disapproveAd']);
        Route::put('/admin/ads/{ad}/status', [AdminController::class, 'updateAdStatus']);
        Route::delete('/admin/ads/{ad}', [AdminController::class, 'deleteAd']);

        // Agent management
        Route::get('/admin/agents', [AdminController::class, 'getAgents']);
        Route::put('/admin/agents/{user}/approve', [AdminController::class, 'approveAgent']);
        Route::put('/admin/agents/{user}/revoke', [AdminController::class, 'revokeAgent']);

        // Affiliate management
        Route::get('/admin/affiliates', [AdminController::class, 'getAffiliates']);
        Route::put('/admin/affiliates/{user}/approve', [AdminController::class, 'approveAffiliate']);
        Route::put('/admin/affiliates/{user}/revoke', [AdminController::class, 'revokeAffiliate']);

        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);

        // Books management
        Route::get('/admin/books', [AdminController::class, 'getBooks']);
        Route::get('/admin/books/{ad}', [AdminController::class, 'showBook']);
        Route::put('/admin/books/{ad}/approve', [AdminController::class, 'approveBook']);
        Route::put('/admin/books/{ad}/reject', [AdminController::class, 'rejectBook']);
        Route::delete('/admin/books/{ad}', [AdminController::class, 'deleteBook']);
        Route::get('/admin/books-stats', [AdminController::class, 'getBooksStats']);

        // News management
        Route::get('/admin/news', [NewsController::class, 'index']);
        Route::post('/admin/news', [NewsController::class, 'store']);
        Route::get('/admin/news/statistics', [NewsController::class, 'statistics']);
        Route::put('/admin/news/{news}', [NewsController::class, 'update']);
        Route::delete('/admin/news/{news}', [NewsController::class, 'destroy']);

        // Newsletter management
        Route::get('/admin/newsletter', [NewsletterController::class, 'index']);
        Route::get('/admin/newsletter/statistics', [NewsletterController::class, 'statistics']);
        Route::get('/admin/newsletter/export', [NewsletterController::class, 'export']);
        Route::delete('/admin/newsletter/{id}', [NewsletterController::class, 'destroy']);

    });
});
