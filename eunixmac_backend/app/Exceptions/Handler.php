<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return $this->handleApiException($e);
            }
        });
    }

    protected function handleApiException(Throwable $e): JsonResponse
    {
        if ($e instanceof HttpException) {
            $statusCode = $e->getStatusCode();
            $message = $e->getMessage() ?: 'An HTTP error occurred.';
        } elseif ($e instanceof ValidationException) {
            return $this->convertValidationExceptionToResponse($e, request());
        } else {
            $statusCode = 500;
            $message = config('app.debug') ? $e->getMessage() : 'A server error occurred.';
        }

        return response()->json([
            'message' => $message,
        ], $statusCode);
    }
}
