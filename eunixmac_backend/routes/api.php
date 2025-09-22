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
use App\Http\Controllers\EducationalMaterialController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SocialLoginController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\AdminSupportController;
use App\Http\Controllers\AdminBoostController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:registration');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.send')->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/categories/{categoryId}/fields', [AdController::class, 'getCategoryFields']);
Route::get('/categories/{categoryId}/filters', [AdController::class, 'getCategoryFilters']);

Route::post('/newsletter/subscribe', function (Request $request) {
    $request->validate([
        'email' => 'required|email|max:255'
    ]);
    
    // For now, just return success. In production, you'd save to a database
    // or integrate with a newsletter service like Mailchimp
    \Log::info('Newsletter subscription request:', ['email' => $request->email]);
    
    return response()->json([
        'success' => true,
        'message' => 'Successfully subscribed to newsletter!'
    ]);
});

Route::get('/ads', [AdController::class, 'index']);
Route::get('/ads/search/suggestions', [AdController::class, 'getSearchSuggestions']);
Route::get('/ads/{ad}', [AdController::class, 'show']);
Route::get('/ads/boost/pricing', [AdController::class, 'getBoostPricing']);

Route::match(['get', 'post'], '/payments/verify', [PaymentController::class, 'verifyPayment']); // Public route for Paystack callback

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
    Route::put('/user/settings', [AuthController::class, 'updateSettings']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

    // Support routes
    Route::post('/support/contact', [SupportController::class, 'contact']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/ads', [AdController::class, 'store']);
    Route::put('/ads/{ad}', [AdController::class, 'update']);
    Route::delete('/ads/{ad}', [AdController::class, 'destroy']);

    Route::get('/ads/{ad}/messages', [MessageController::class, 'index']);
    Route::post('/ads/{ad}/messages', [MessageController::class, 'store']);
    Route::put('/conversations/{conversationId}/read', [MessageController::class, 'markAsRead']);

    Route::post('/ads/{ad}/boost', [AdController::class, 'initiateBoost'])->middleware('throttle:boost-payment');
    Route::post('/ads/boost/verify', [AdController::class, 'verifyBoostPayment'])->middleware('throttle:boost-payment');
    Route::post('/ads/boost/check-expiry', [AdController::class, 'checkBoostExpiry']);
    Route::get('/ads/boost/history', [AdController::class, 'getBoostHistory']);

    Route::get('/educational-materials', [EducationalMaterialController::class, 'index']);
    Route::get('/educational-materials/{ad}', [EducationalMaterialController::class, 'show']);
    Route::post('/educational-materials/{ad}/pay', [EducationalMaterialController::class, 'initiatePayment']);
    Route::get('/educational-materials/{ad}/download', [EducationalMaterialController::class, 'download']);

    Route::middleware('can:agent')->group(function () {
        Route::post('/educational-materials', [EducationalMaterialController::class, 'store']);
        Route::put('/educational-materials/{ad}', [EducationalMaterialController::class, 'update']);
        Route::delete('/educational-materials/{ad}', [EducationalMaterialController::class, 'destroy']);
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
        Route::get('/admin/ads', [AdminController::class, 'getAds']);
        Route::put('/admin/ads/{ad}/approve', [AdminController::class, 'approveAd']);
        Route::put('/admin/ads/{ad}/reject', [AdminController::class, 'rejectAd']);
        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);

        // Educational materials management
        Route::get('/admin/materials', [AdminController::class, 'getMaterials']);
        Route::get('/admin/materials/{ad}', [AdminController::class, 'showMaterial']);
        Route::put('/admin/materials/{ad}/approve', [AdminController::class, 'approveMaterial']);
        Route::put('/admin/materials/{ad}/reject', [AdminController::class, 'rejectMaterial']);
        Route::delete('/admin/materials/{ad}', [AdminController::class, 'deleteMaterial']);
        Route::get('/admin/materials-stats', [AdminController::class, 'getMaterialsStats']);

        // Boost admin routes
        Route::get('/admin/boost/analytics', [AdminBoostController::class, 'analytics']);
        Route::get('/admin/boost/statistics', [AdminBoostController::class, 'statistics']);
    });
});
