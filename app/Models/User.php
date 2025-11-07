<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'workos_id',
        'avatar',
        'username',
        'employee_id',
        'phone',
        'department',
        'position',
        'is_active',
        'last_login_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'workos_id',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Get the roles for the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['assigned_at', 'assigned_by'])
            ->withTimestamps();
    }

    /**
     * Get all permissions for the user through roles.
     */
    public function permissions()
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|array $role): bool
    {
        if (is_array($role)) {
            return $this->roles()->whereIn('name', $role)->exists();
        }

        return $this->roles()->where('name', $role)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->count() === count($roles);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        // ADMIN BYPASS: Admin always has all permissions
        if ($this->hasRole('admin')) {
            return true;
        }

        // For other roles, check permissions normally
        return $this->permissions()->contains('name', $permission);
    }

    /**
     * Check if user can perform action (permission check).
     */
    public function can($ability, $arguments = []): bool
    {
        // First check Laravel's built-in authorization
        if (parent::can($ability, $arguments)) {
            return true;
        }

        // Then check our custom permission system
        return $this->hasPermission($ability);
    }

    /**
     * Assign role to user.
     */
    public function assignRole(Role|string $role, ?User $assignedBy = null): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->syncWithoutDetaching([
            $role->id => [
                'assigned_at' => now(),
                'assigned_by' => $assignedBy?->id,
            ],
        ]);

        return $this;
    }

    /**
     * Remove role from user.
     */
    public function removeRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);

        return $this;
    }

    /**
     * Sync roles for user.
     */
    public function syncRoles(array $roles, ?User $assignedBy = null): self
    {
        $roleIds = collect($roles)->mapWithKeys(function ($role) use ($assignedBy) {
            if ($role instanceof Role) {
                $roleId = $role->id;
            } else {
                $roleId = Role::where('name', $role)->firstOrFail()->id;
            }

            return [$roleId => [
                'assigned_at' => now(),
                'assigned_by' => $assignedBy?->id,
            ]];
        });

        $this->roles()->sync($roleIds);

        return $this;
    }

    /**
     * Update last login information.
     */
    public function updateLastLogin(?string $ip = null): self
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip ?? request()->ip(),
        ]);

        return $this;
    }

    /**
     * Scope: Active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: By role
     */
    public function scopeWithRole($query, string $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('name', $role);
        });
    }

    /**
     * Scope: By permission
     */
    public function scopeWithPermission($query, string $permission)
    {
        return $query->whereHas('roles.permissions', function ($q) use ($permission) {
            $q->where('name', $permission);
        });
    }

    /**
     * Get user's role names as array.
     */
    public function getRoleNamesAttribute(): array
    {
        return $this->roles()->pluck('name')->toArray();
    }

    /**
     * Get user's permission names as array.
     */
    public function getPermissionNamesAttribute(): array
    {
        return $this->permissions()->pluck('name')->toArray();
    }
}
