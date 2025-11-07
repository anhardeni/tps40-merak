<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\KdGudang;
use App\Models\KdTps;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KdGudangController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KdGudang::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kd_gudang', 'like', "%{$search}%")
                    ->orWhere('nm_gudang', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // TPS filter
        if ($request->has('kd_tps') && $request->kd_tps) {
            $query->where('kd_tps', $request->kd_tps);
        }

        $kdGudangs = $query->orderBy('kd_gudang', 'asc')
            ->paginate(15)
            ->through(fn ($item) => [
                'kd_gudang' => $item->kd_gudang,
                'nm_gudang' => $item->nm_gudang,
                'kd_tps' => $item->kd_tps,
                'alamat' => $item->alamat,
                'kapasitas' => $item->kapasitas,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/KdGudang/Index', [
            'kdGudangs' => [
                'data' => $kdGudangs->items(),
                'links' => $kdGudangs->linkCollection()->toArray(),
            ],
            'kdTpsList' => KdTps::orderBy('kd_tps')->get(['kd_tps', 'nm_tps']),
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'kd_tps' => $request->kd_tps ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reference/KdGudang/Create', [
            'kdTpsList' => KdTps::orderBy('kd_tps')->get(['kd_tps', 'nm_tps']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kd_gudang' => 'required|string|max:10|unique:kd_gudang,kd_gudang',
            'nm_gudang' => 'required|string|max:255',
            'kd_tps' => 'required|string|exists:kd_tps,kd_tps',
            'alamat' => 'nullable|string',
            'kapasitas' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        KdGudang::create($validated);

        return redirect()->route('reference.kd-gudang.index')
            ->with('success', 'Kode gudang berhasil ditambahkan');
    }

    public function show(KdGudang $kdGudang): Response
    {
        return Inertia::render('Reference/KdGudang/Show', [
            'kdGudang' => [
                'kd_gudang' => $kdGudang->kd_gudang,
                'nm_gudang' => $kdGudang->nm_gudang,
                'kd_tps' => $kdGudang->kd_tps,
                'alamat' => $kdGudang->alamat,
                'kapasitas' => $kdGudang->kapasitas,
                'is_active' => $kdGudang->is_active,
                'created_at' => $kdGudang->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $kdGudang->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(KdGudang $kdGudang): Response
    {
        return Inertia::render('Reference/KdGudang/Edit', [
            'kdGudang' => [
                'kd_gudang' => $kdGudang->kd_gudang,
                'nm_gudang' => $kdGudang->nm_gudang,
                'kd_tps' => $kdGudang->kd_tps,
                'alamat' => $kdGudang->alamat,
                'kapasitas' => $kdGudang->kapasitas,
                'is_active' => $kdGudang->is_active,
            ],
            'kdTpsList' => KdTps::orderBy('kd_tps')->get(['kd_tps', 'nm_tps']),
        ]);
    }

    public function update(Request $request, KdGudang $kdGudang): RedirectResponse
    {
        $validated = $request->validate([
            'nm_gudang' => 'required|string|max:255',
            'kd_tps' => 'required|string|exists:kd_tps,kd_tps',
            'alamat' => 'nullable|string',
            'kapasitas' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $kdGudang->update($validated);

        return redirect()->route('reference.kd-gudang.index')
            ->with('success', 'Kode gudang berhasil diperbarui');
    }

    public function destroy(KdGudang $kdGudang): RedirectResponse
    {
        try {
            $kdGudang->delete();

            return redirect()->route('reference.kd-gudang.index')
                ->with('success', 'Kode gudang berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus kode gudang ini karena masih digunakan oleh data lain',
            ]);
        }
    }
}
