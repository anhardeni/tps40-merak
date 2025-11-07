<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class BeacukaiCredential extends Model
{
    use HasFactory;

    protected $table = 'beacukai_credentials';

    protected $fillable = [
        'service_name',
        'service_type',
        'username',
        'password',
        'endpoint_url',
        'additional_config',
        'is_active',
        'is_test_mode',
        'description',
        'usage_count',
        'created_by',
        'updated_by',
        'last_used_at',
    ];

    protected $casts = [
        'additional_config' => 'array',
        'is_active' => 'boolean',
        'is_test_mode' => 'boolean',
        'usage_count' => 'integer',
        'last_used_at' => 'datetime',
    ];

    protected $hidden = [
        'password', // Hide password from JSON serialization
    ];

    /**
     * Set password attribute dengan encryption
     */
    public function setPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['password'] = Crypt::encryptString($value);
        }
    }

    /**
     * Get password attribute dengan decryption
     */
    public function getPasswordAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Get decrypted password untuk penggunaan internal
     */
    public function getDecryptedPassword()
    {
        return $this->password;
    }

    /**
     * Update usage statistics
     */
    public function recordUsage()
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => Carbon::now()]);
    }

    /**
     * Get credentials by service name
     */
    public static function getByService($serviceName)
    {
        return static::where('service_name', $serviceName)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get active credentials only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get production credentials (not test mode)
     */
    public function scopeProduction($query)
    {
        return $query->where('is_test_mode', false);
    }

    /**
     * Get test credentials
     */
    public function scopeTest($query)
    {
        return $query->where('is_test_mode', true);
    }

    /**
     * Relationship: Creator
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Updater
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if credentials are configured properly
     */
    public function isConfigured()
    {
        return ! empty($this->username) &&
               ! empty($this->password) &&
               ! empty($this->endpoint_url) &&
               $this->is_active;
    }

    /**
     * Get service configuration for usage
     */
    public function getServiceConfig()
    {
        return [
            'service_name' => $this->service_name,
            'service_type' => $this->service_type,
            'username' => $this->username,
            'password' => $this->getDecryptedPassword(),
            'endpoint_url' => $this->endpoint_url,
            'additional_config' => $this->additional_config ?? [],
            'is_test_mode' => $this->is_test_mode,
        ];
    }
}
