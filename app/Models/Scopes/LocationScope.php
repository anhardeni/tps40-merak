<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class LocationScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        // 1. If not logged in (e.g. CLI), do nothing
        if (!$user) {
            return;
        }

        // 2. Admin/Superuser bypass
        if ($user->hasRole('admin') || ($user->hasPermission('access-all-locations'))) {
            return;
        }

        // 3. Get user's assigned locations
        $access = \DB::table('user_location_access')
            ->where('user_id', $user->id)
            ->get();

        if ($access->isEmpty()) {
            $builder->whereRaw('1 = 0');
            return;
        }

        $allowedTps = $access->pluck('kd_tps')->unique()->toArray();
        $allowedGudang = $access->pluck('kd_gudang')->unique()->toArray();

        $table = $model->getTable();

        // Handle 'tangki' table which joins to 'documents'
        if ($table === 'tangki') {
            $builder->whereExists(function ($query) use ($allowedTps, $allowedGudang) {
                $query->select(\DB::raw(1))
                    ->from('documents')
                    ->whereColumn('documents.id', 'tangki.document_id')
                    ->whereIn('documents.kd_tps', $allowedTps)
                    ->whereIn('documents.kd_gudang', $allowedGudang);
            });
            return;
        }

        // Default: Apply filtering on the model's table
        if (\Schema::hasColumn($table, 'kd_tps')) {
            $builder->whereIn($table.'.kd_tps', $allowedTps);
        }
        
        if (\Schema::hasColumn($table, 'kd_gudang')) {
            $builder->whereIn($table.'.kd_gudang', $allowedGudang);
        }
    }
}
