<?php

namespace App\Exceptions\Custom;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class PermissionDeniedException extends AccessDeniedHttpException
{
    public function __construct(string $message = 'You do not have permission to perform this action.', \Throwable $previous = null, int $code = 0, array $headers = [])
    {
        parent::__construct($message, $previous, $code, $headers);
    }
}
