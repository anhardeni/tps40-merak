<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\KdTps;
use App\Models\KdGudang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserLocationAccessController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles']);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->paginate(10)->withQueryString();

        // Get all location assignments
        $assignments = DB::table('user_location_access')
            ->join('users', 'user_location_access.user_id', '=', 'users.id')
            ->join('kd_tps', 'user_location_access.kd_tps', '=', 'kd_tps.kd_tps')
            ->join('kd_gudang', 'user_location_access.kd_gudang', '=', 'kd_gudang.kd_gudang')
            ->select(
                'user_location_access.id',
                'user_location_access.user_id',
                'users.name as user_name',
                'user_location_access.kd_tps',
                'kd_tps.nm_tps',
                'user_location_access.kd_gudang',
                'kd_gudang.nm_gudang'
            )
            ->get();

        return Inertia::render('Admin/UserLocationAccess/Index', [
            'users' => $users,
            'assignments' => $assignments,
            'filters' => $request->only(['search']),
            'kdTps' => KdTps::where('is_active', true)->get(),
            'kdGudang' => KdGudang::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'kd_tps' => 'required|exists:kd_tps,kd_tps',
            'kd_gudang' => 'required|exists:kd_gudang,kd_gudang',
        ]);

        // Check for duplicates
        $exists = DB::table('user_location_access')
            ->where('user_id', $validated['user_id'])
            ->where('kd_tps', $validated['kd_tps'])
            ->where('kd_gudang', $validated['kd_gudang'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Akses lokasi ini sudah ada untuk user tersebut.');
        }

        DB::table('user_location_access')->insert([
            'user_id' => $validated['user_id'],
            'kd_tps' => $validated['kd_tps'],
            'kd_gudang' => $validated['kd_gudang'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Akses lokasi berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        DB::table('user_location_access')->where('id', $id)->delete();
        return back()->with('success', 'Akses lokasi berhasil dihapus.');
    }
}
