<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:users.view')->only(['index', 'show']);
        $this->middleware('permission:users.create')->only(['create', 'store']);
        $this->middleware('permission:users.edit')->only(['edit', 'update']);
        $this->middleware('permission:users.delete')->only(['destroy']);
        $this->middleware('permission:users.manage-roles')->only(['updateRoles']);
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $users = User::with(['roles'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->withRole($role);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_active', $request->status === 'active');
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $roles = Role::active()->orderBy('display_name')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        $roles = Role::active()->orderBy('display_name')->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:50|unique:users',
            'employee_id' => 'nullable|string|max:20|unique:users',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:50',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'employee_id' => $request->employee_id,
            'phone' => $request->phone,
            'department' => $request->department,
            'position' => $request->position,
            'password' => Hash::make($request->password),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Assign roles
        if ($request->roles) {
            $user->roles()->attach($request->roles, [
                'assigned_at' => now(),
                'assigned_by' => auth()->id(),
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load(['roles.permissions']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the user.
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::active()->orderBy('display_name')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'username' => 'nullable|string|max:50|unique:users,username,'.$user->id,
            'employee_id' => 'nullable|string|max:20|unique:users,employee_id,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->username,
            'employee_id' => $request->employee_id,
            'phone' => $request->phone,
            'department' => $request->department,
            'position' => $request->position,
            'is_active' => $request->is_active ?? true,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // Update roles
        if ($request->has('roles')) {
            $roleData = collect($request->roles)->mapWithKeys(function ($roleId) {
                return [$roleId => [
                    'assigned_at' => now(),
                    'assigned_by' => auth()->id(),
                ]];
            });

            $user->roles()->sync($roleData);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        // Prevent deletion of super admin
        if ($user->hasRole('super-admin') && User::withRole('super-admin')->count() === 1) {
            return back()->with('error', 'Cannot delete the last super administrator.');
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->roles()->detach();
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    /**
     * Update user roles.
     */
    public function updateRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ]);

        $roleData = collect($request->roles)->mapWithKeys(function ($roleId) {
            return [$roleId => [
                'assigned_at' => now(),
                'assigned_by' => auth()->id(),
            ]];
        });

        $user->roles()->sync($roleData);

        return back()->with('success', 'User roles updated successfully.');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user)
    {
        // Prevent deactivating super admin
        if ($user->hasRole('super-admin') && User::withRole('super-admin')->where('is_active', true)->count() === 1) {
            return back()->with('error', 'Cannot deactivate the last active super administrator.');
        }

        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', 'User status updated successfully.');
    }
}
