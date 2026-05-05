<?php

namespace App\Traits;

use App\Models\Scopes\LocationScope;

trait IsolatableByLocation
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new LocationScope);
    }

    /**
     * Scope a query to only include locations the user has access to.
     * This is useful if the global scope is removed or for manual checks.
     */
    public function scopeForCurrentUser($query)
    {
        return (new LocationScope)->apply($query, $this);
    }
}
