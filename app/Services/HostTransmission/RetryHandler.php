<?php

namespace App\Services\HostTransmission;

use Illuminate\Support\Facades\Log;

class RetryHandler
{
    /**
     * Maximum retry attempts
     */
    protected int $maxAttempts;

    /**
     * Base delay in seconds
     */
    protected float $baseDelay;

    /**
     * Exponential backoff multiplier
     */
    protected float $multiplier;

    public function __construct(
        int $maxAttempts = 3,
        float $baseDelay = 1.0,
        float $multiplier = 3.0
    ) {
        $this->maxAttempts = $maxAttempts;
        $this->baseDelay = $baseDelay;
        $this->multiplier = $multiplier;
    }

    /**
     * Execute callback with exponential backoff retry
     *
     * @param  callable  $callback  Function to execute
     * @param  array  $context  Context for logging
     * @return mixed Result from callback
     *
     * @throws \Exception Last exception if all retries fail
     */
    public function execute(callable $callback, array $context = []): mixed
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $this->maxAttempts) {
            $attempt++;

            try {
                Log::info('RetryHandler: Attempt '.$attempt.'/'.$this->maxAttempts, $context);

                // Execute callback
                $result = $callback();

                if ($attempt > 1) {
                    Log::info('RetryHandler: Success after '.$attempt.' attempts', $context);
                }

                return $result;

            } catch (\Exception $e) {
                $lastException = $e;

                Log::warning('RetryHandler: Attempt '.$attempt.' failed', array_merge($context, [
                    'error' => $e->getMessage(),
                    'error_code' => $this->getErrorCode($e),
                ]));

                // Check if should retry
                if (! $this->shouldRetry($e, $attempt)) {
                    Log::error('RetryHandler: Non-retryable error, stopping', array_merge($context, [
                        'error' => $e->getMessage(),
                        'attempt' => $attempt,
                    ]));

                    throw $e;
                }

                // Last attempt failed
                if ($attempt >= $this->maxAttempts) {
                    Log::error('RetryHandler: All attempts exhausted', array_merge($context, [
                        'total_attempts' => $attempt,
                        'last_error' => $e->getMessage(),
                    ]));

                    throw $e;
                }

                // Calculate delay with exponential backoff
                $delay = $this->calculateDelay($attempt);

                Log::info('RetryHandler: Waiting before retry', array_merge($context, [
                    'delay_seconds' => $delay,
                    'next_attempt' => $attempt + 1,
                ]));

                // Wait before retry
                $this->sleep($delay);
            }
        }

        // Should never reach here, but throw last exception as fallback
        throw $lastException ?? new \Exception('Retry handler failed with no exception');
    }

    /**
     * Determine if error should be retried
     */
    protected function shouldRetry(\Exception $exception, int $attempt): bool
    {
        $errorCode = $this->getErrorCode($exception);
        $message = strtolower($exception->getMessage());

        // Do NOT retry on 4xx client errors (except 401 Unauthorized)
        if ($errorCode >= 400 && $errorCode < 500 && $errorCode !== 401) {
            return false;
        }

        // Do NOT retry on authentication errors (after token refresh attempted)
        if (str_contains($message, 'authentication failed') ||
            str_contains($message, 'invalid credentials') ||
            str_contains($message, 'unauthorized')) {
            // Only retry 401 on first attempt (token refresh happens in transmitter)
            return $attempt === 1 && $errorCode === 401;
        }

        // Do NOT retry on validation errors
        if (str_contains($message, 'validation error') ||
            str_contains($message, 'invalid format') ||
            str_contains($message, 'missing required field')) {
            return false;
        }

        // RETRY on network/connection errors
        if (str_contains($message, 'connection') ||
            str_contains($message, 'timeout') ||
            str_contains($message, 'timed out') ||
            str_contains($message, 'network') ||
            str_contains($message, 'dns')) {
            return true;
        }

        // RETRY on 5xx server errors
        if ($errorCode >= 500 && $errorCode < 600) {
            return true;
        }

        // RETRY on 401 (first attempt - allows token refresh)
        if ($errorCode === 401 && $attempt === 1) {
            return true;
        }

        // Default: retry on unknown errors
        return true;
    }

    /**
     * Calculate delay with exponential backoff
     *
     * Formula: baseDelay * (multiplier ^ (attempt - 1))
     * Example with defaults:
     * - Attempt 1 → 1s * (3^0) = 1s
     * - Attempt 2 → 1s * (3^1) = 3s
     * - Attempt 3 → 1s * (3^2) = 9s
     */
    protected function calculateDelay(int $attempt): float
    {
        return $this->baseDelay * pow($this->multiplier, $attempt - 1);
    }

    /**
     * Sleep for specified seconds (testable)
     */
    protected function sleep(float $seconds): void
    {
        usleep((int) ($seconds * 1_000_000));
    }

    /**
     * Extract HTTP error code from exception
     */
    protected function getErrorCode(\Exception $exception): ?int
    {
        // Check if Guzzle/HTTP exception
        if (method_exists($exception, 'getCode')) {
            $code = $exception->getCode();
            if (is_int($code) && $code >= 100 && $code < 600) {
                return $code;
            }
        }

        // Try to extract from message
        $message = $exception->getMessage();
        if (preg_match('/HTTP Error: (\d{3})/', $message, $matches)) {
            return (int) $matches[1];
        }

        if (preg_match('/status code (\d{3})/i', $message, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Get max attempts
     */
    public function getMaxAttempts(): int
    {
        return $this->maxAttempts;
    }

    /**
     * Set max attempts
     */
    public function setMaxAttempts(int $maxAttempts): self
    {
        $this->maxAttempts = $maxAttempts;

        return $this;
    }

    /**
     * Get base delay
     */
    public function getBaseDelay(): float
    {
        return $this->baseDelay;
    }

    /**
     * Set base delay
     */
    public function setBaseDelay(float $baseDelay): self
    {
        $this->baseDelay = $baseDelay;

        return $this;
    }
}
