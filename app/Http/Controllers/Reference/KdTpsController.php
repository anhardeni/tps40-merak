<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\KdTps;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KdTpsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KdTps::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kd_tps', 'like', "%{$search}%")
                    ->orWhere('nm_tps', 'like', "%{$search}%");
            });
        }

        $kdTpsList = $query->orderBy('kd_tps', 'asc')
            ->paginate(15)
            ->through(fn ($item) => [
                'kd_tps' => $item->kd_tps,
                'nm_tps' => $item->nm_tps,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/KdTps/Index', [
            'kdTpsList' => [
                'data' => $kdTpsList->items(),
                'links' => $kdTpsList->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reference/KdTps/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kd_tps' => 'required|string|max:10|unique:kd_tps,kd_tps',
            'nm_tps' => 'required|string|max:255',
        ]);

        KdTps::create($validated);

        return redirect()->route('reference.kd-tps.index')
            ->with('success', 'Kode TPS berhasil ditambahkan');
    }

    public function show(KdTps $kdTps): Response
    {
        return Inertia::render('Reference/KdTps/Show', [
            'kdTps' => [
                'kd_tps' => $kdTps->kd_tps,
                'nm_tps' => $kdTps->nm_tps,
                'created_at' => $kdTps->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $kdTps->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(KdTps $kdTps): Response
    {
        return Inertia::render('Reference/KdTps/Edit', [
            'kdTps' => [
                'kd_tps' => $kdTps->kd_tps,
                'nm_tps' => $kdTps->nm_tps,
            ],
        ]);
    }

    public function update(Request $request, KdTps $kdTps): RedirectResponse
    {
        $validated = $request->validate([
            'nm_tps' => 'required|string|max:255',
        ]);

        $kdTps->update($validated);

        return redirect()->route('reference.kd-tps.index')
            ->with('success', 'Kode TPS berhasil diperbarui');
    }

    public function destroy(KdTps $kdTps): RedirectResponse
    {
        try {
            $kdTps->delete();

            return redirect()->route('reference.kd-tps.index')
                ->with('success', 'Kode TPS berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus kode TPS ini karena masih digunakan oleh data lain',
            ]);
        }
    }
}
