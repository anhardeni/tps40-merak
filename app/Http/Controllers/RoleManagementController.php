<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:roles.view')->only(['index', 'show']);
        $this->middleware('permission:roles.create')->only(['create', 'store']);
        $this->middleware('permission:roles.edit')->only(['edit', 'update']);
        $this->middleware('permission:roles.delete')->only(['destroy']);
        $this->middleware('permission:roles.assign-permissions')->only(['updatePermissions']);
    }

    /**
     * Display a listing of roles.
     */
    public function index(Request $request)
    {
        $roles = Role::withCount(['users', 'permissions'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%");
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy('display_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create()
    {
        $permissions = Permission::active()
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module');

        return Inertia::render('Admin/Roles/Create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:roles|alpha_dash',
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_active' => true,
        ]);

        // Assign permissions
        if ($request->permissions) {
            $role->permissions()->attach($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        $role->load(['permissions', 'users']);

        return Inertia::render('Admin/Roles/Show', [
            'role' => $role,
        ]);
    }

    /**
     * Show the form for editing the role.
     */
    public function edit(Role $role)
    {
        $role->load('permissions');

        $permissions = Permission::active()
            ->orderBy('module')
            ->orderBy('display_name')
            ->get()
            ->groupBy('module');

        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:50|alpha_dash|unique:roles,name,'.$role->id,
            'display_name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Prevent disabling super-admin role
        if ($role->name === 'super-admin' && $request->is_active === false) {
            return back()->with('error', 'Cannot deactivate the super-admin role.');
        }

        $role->update([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
        ]);

        // Update permissions (except for super-admin which should keep all permissions)
        if ($role->name !== 'super-admin' && $request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role)
    {
        // Prevent deletion of system roles
        $systemRoles = ['super-admin', 'admin'];
        if (in_array($role->name, $systemRoles)) {
            return back()->with('error', 'Cannot delete system roles.');
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Cannot delete role that has assigned users.');
        }

        $role->permissions()->detach();
        $role->delete();

        return redirect()->route('admin.roles.index')
            ->with('success', 'Role deleted successfully.');
    }

    /**
     * Update role permissions.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Prevent modifying super-admin permissions
        if ($role->name === 'super-admin') {
            return back()->with('error', 'Cannot modify super-admin permissions.');
        }

        $role->permissions()->sync($request->permissions);

        return back()->with('success', 'Role permissions updated successfully.');
    }

    /**
     * Toggle role active status.
     */
    public function toggleStatus(Role $role)
    {
        // Prevent deactivating system roles
        $systemRoles = ['super-admin', 'admin'];
        if (in_array($role->name, $systemRoles)) {
            return back()->with('error', 'Cannot deactivate system roles.');
        }

        $role->update(['is_active' => ! $role->is_active]);

        return back()->with('success', 'Role status updated successfully.');
    }
}
