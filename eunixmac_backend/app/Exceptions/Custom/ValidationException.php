<?php

namespace App\Exceptions\Custom;

use Symfony\Component\HttpKernel\Exception\HttpException;

class ValidationException extends HttpException
{
    public function __construct(string $message = 'Something went wrong. Please try again later.', \Throwable $previous = null, int $code = 0, array $headers = [])
    {
        parent::__construct(422, $message, $previous, $headers, $code);
    }
}
