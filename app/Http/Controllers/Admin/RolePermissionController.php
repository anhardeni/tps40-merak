<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    /**
     * Sync permissions for a role
     */
    public function sync(Request $request, Role $role): RedirectResponse
    {
        if (in_array($role->name, ['admin', 'super-admin']) && !auth()->user()->hasRole(['admin', 'super-admin'])) {
            return back()->with('error', 'Cannot modify Admin role permissions without Admin access.');
        }

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($request->permissions);

        return back()->with('success', 'Permissions updated successfully.');
    }
}
