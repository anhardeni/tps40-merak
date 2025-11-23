<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\KdDok;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KdDokController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KdDok::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kd_dok', 'like', "%{$search}%")
                    ->orWhere('nm_dok', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%");
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

        $kdDoks = $query->orderBy('kd_dok', 'asc')
            ->paginate(15)
            ->through(fn ($item) => [
                'kd_dok' => $item->kd_dok,
                'nm_dok' => $item->nm_dok,
                'keterangan' => $item->keterangan,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/KdDok/Index', [
            'kdDoks' => [
                'data' => $kdDoks->items(),
                'links' => $kdDoks->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reference/KdDok/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kd_dok' => 'required|string|max:10|unique:kd_dok,kd_dok',
            'nm_dok' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        KdDok::create($validated);

        return redirect()->route('kd-dok.index')
            ->with('success', 'Kode dokumen berhasil ditambahkan');
    }

    public function show(KdDok $kdDok): Response
    {
        return Inertia::render('Reference/KdDok/Show', [
            'kdDok' => [
                'kd_dok' => $kdDok->kd_dok,
                'nm_dok' => $kdDok->nm_dok,
                'keterangan' => $kdDok->keterangan,
                'is_active' => $kdDok->is_active,
                'created_at' => $kdDok->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $kdDok->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(KdDok $kdDok): Response
    {
        return Inertia::render('Reference/KdDok/Edit', [
            'kdDok' => [
                'kd_dok' => $kdDok->kd_dok,
                'nm_dok' => $kdDok->nm_dok,
                'keterangan' => $kdDok->keterangan,
                'is_active' => $kdDok->is_active,
            ],
        ]);
    }

    public function update(Request $request, KdDok $kdDok): RedirectResponse
    {
        $validated = $request->validate([
            'nm_dok' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $kdDok->update($validated);

        return redirect()->route('kd-dok.index')
            ->with('success', 'Kode dokumen berhasil diperbarui');
    }

    public function destroy(KdDok $kdDok): RedirectResponse
    {
        try {
            $kdDok->delete();

            return redirect()->route('reference.kd-dok.index')
                ->with('success', 'Kode dokumen berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus kode dokumen ini karena masih digunakan oleh data lain',
            ]);
        }
    }
}
