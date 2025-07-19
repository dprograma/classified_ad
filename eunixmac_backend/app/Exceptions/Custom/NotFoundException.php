<?php

namespace App\Exceptions\Custom;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class NotFoundException extends NotFoundHttpException
{
    public function __construct(string $message = 'The requested resource was not found.', \Throwable $previous = null, int $code = 0, array $headers = [])
    {
        parent::__construct($message, $previous, $code, $headers);
    }
}
