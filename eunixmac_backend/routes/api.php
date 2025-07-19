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

Route::post('/register', [AuthController::class, 'register']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.send');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/ads', [AdController::class, 'index']);
Route::get('/ads/{ad}', [AdController::class, 'show']);

Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']); // Public route for Paystack callback

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/become-agent', [AuthController::class, 'becomeAgent']);
    Route::post('/user/become-affiliate', [AuthController::class, 'becomeAffiliate']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

    Route::post('/ads', [AdController::class, 'store']);
    Route::put('/ads/{ad}', [AdController::class, 'update']);
    Route::delete('/ads/{ad}', [AdController::class, 'destroy']);

    Route::get('/ads/{ad}/messages', [MessageController::class, 'index']);
    Route::post('/ads/{ad}/messages', [MessageController::class, 'store']);

    Route::post('/ads/{ad}/boost', [PaymentController::class, 'initiateAdBoost']);

    Route::post('/educational-materials/{ad}/pay', [EducationalMaterialController::class, 'initiatePayment']);
    Route::get('/educational-materials/{ad}/download', [EducationalMaterialController::class, 'download']);

    Route::middleware('can:agent')->group(function () {
        Route::post('/educational-materials', [EducationalMaterialController::class, 'store']);
    });

    Route::middleware('can:admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::put('/admin/users/{user}/verify', [AdminController::class, 'verifyUser']);
        Route::get('/admin/ads', [AdminController::class, 'getAds']);
        Route::put('/admin/ads/{ad}/approve', [AdminController::class, 'approveAd']);
        Route::put('/admin/ads/{ad}/reject', [AdminController::class, 'rejectAd']);
        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
    });
});
