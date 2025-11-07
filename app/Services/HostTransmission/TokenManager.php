<?php

namespace App\Services\HostTransmission;

use App\Models\BeacukaiCredential;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TokenManager
{
    /**
     * Get valid token (use cached or login)
     */
    public function getValidToken(BeacukaiCredential $credential): string
    {
        $config = $credential->additional_config ?? [];

        // Check if cached token exists and not expired
        if ($this->hasValidCachedToken($config)) {
            Log::debug('TokenManager: Using cached token', [
                'service' => $credential->service_name,
                'expires_at' => $config['token_expires_at'] ?? null,
            ]);

            return $config['cached_token'];
        }

        // Login to get new token
        Log::info('TokenManager: Getting new token via login', [
            'service' => $credential->service_name,
            'auth_endpoint' => $config['auth_endpoint'] ?? null,
        ]);

        return $this->login($credential);
    }

    /**
     * Refresh expired token
     */
    public function refreshToken(BeacukaiCredential $credential): string
    {
        $config = $credential->additional_config ?? [];

        // Try refresh token first
        if (! empty($config['cached_refresh_token']) && ! empty($config['refresh_endpoint'])) {
            try {
                Log::info('TokenManager: Attempting token refresh', [
                    'service' => $credential->service_name,
                    'refresh_endpoint' => $config['refresh_endpoint'],
                ]);

                $response = Http::timeout(30)->post($config['refresh_endpoint'], [
                    'refresh_token' => $config['cached_refresh_token'],
                ]);

                if ($response->successful()) {
                    $data = $response->json();

                    return $this->cacheToken($credential, $data);
                }

                Log::warning('TokenManager: Refresh failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            } catch (\Exception $e) {
                Log::warning('TokenManager: Refresh exception, will re-login', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Fallback: re-login
        Log::info('TokenManager: Falling back to re-login');

        return $this->login($credential);
    }

    /**
     * Login to get new token
     */
    protected function login(BeacukaiCredential $credential): string
    {
        $config = $credential->additional_config ?? [];
        $authEndpoint = $config['auth_endpoint'] ?? null;

        if (empty($authEndpoint)) {
            throw new \Exception('Auth endpoint not configured for '.$credential->service_name);
        }

        try {
            $requestBody = [
                'username' => $credential->username,
                'password' => $credential->getDecryptedPassword(),
            ];

            Log::debug('TokenManager: Sending login request', [
                'endpoint' => $authEndpoint,
                'username' => $credential->username,
            ]);

            $response = Http::timeout(30)->post($authEndpoint, $requestBody);

            if (! $response->successful()) {
                throw new \Exception('Login failed with status '.$response->status().': '.$response->body());
            }

            $data = $response->json();

            if (empty($data)) {
                throw new \Exception('Login response is empty');
            }

            return $this->cacheToken($credential, $data);

        } catch (\Exception $e) {
            Log::error('TokenManager: Login failed', [
                'service' => $credential->service_name,
                'endpoint' => $authEndpoint,
                'username' => $credential->username,
                'error' => $e->getMessage(),
            ]);

            throw new \Exception('Failed to obtain authentication token: '.$e->getMessage());
        }
    }

    /**
     * Cache token in credential
     */
    protected function cacheToken(BeacukaiCredential $credential, array $responseData): string
    {
        $config = $credential->additional_config ?? [];

        // Extract token from response
        $tokenField = $config['token_field'] ?? 'access_token';
        $token = $responseData[$tokenField] ?? null;

        if (empty($token)) {
            throw new \Exception("Token field '{$tokenField}' not found in response. Available fields: ".implode(', ', array_keys($responseData)));
        }

        // Calculate expiry time
        $expirySeconds = $responseData['expires_in'] ?? $config['token_expiry'] ?? 86400; // Default: 24 hours
        $expiresAt = Carbon::now()->addSeconds($expirySeconds);

        // Update credential with cached token
        $config['cached_token'] = $token;
        $config['token_expires_at'] = $expiresAt->toIso8601String();

        // Cache refresh token if exists
        $refreshTokenField = $config['refresh_token_field'] ?? 'refresh_token';
        if (isset($responseData[$refreshTokenField])) {
            $config['cached_refresh_token'] = $responseData[$refreshTokenField];
        }

        $credential->update(['additional_config' => $config]);

        Log::info('TokenManager: Token cached successfully', [
            'service' => $credential->service_name,
            'expires_at' => $expiresAt->toDateTimeString(),
            'expires_in_hours' => round($expirySeconds / 3600, 2),
        ]);

        return $token;
    }

    /**
     * Check if cached token is valid
     */
    protected function hasValidCachedToken(array $config): bool
    {
        if (empty($config['cached_token']) || empty($config['token_expires_at'])) {
            return false;
        }

        try {
            $expiresAt = Carbon::parse($config['token_expires_at']);

            // Token valid if expires in more than 5 minutes (safety buffer)
            return $expiresAt->isFuture() && $expiresAt->diffInMinutes(now()) > 5;
        } catch (\Exception $e) {
            Log::warning('TokenManager: Error parsing token expiry', [
                'expires_at' => $config['token_expires_at'],
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Clear cached token (for manual refresh or logout)
     */
    public function clearToken(BeacukaiCredential $credential): void
    {
        $config = $credential->additional_config ?? [];

        $config['cached_token'] = null;
        $config['cached_refresh_token'] = null;
        $config['token_expires_at'] = null;

        $credential->update(['additional_config' => $config]);

        Log::info('TokenManager: Token cleared', [
            'service' => $credential->service_name,
        ]);
    }
}
