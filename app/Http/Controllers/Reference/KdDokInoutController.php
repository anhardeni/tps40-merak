<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\KdDokInout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KdDokInoutController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KdDokInout::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kd_dok_inout', 'like', "%{$search}%")
                    ->orWhere('nm_dok_inout', 'like', "%{$search}%")
                    ->orWhere('jenis', 'like', "%{$search}%");
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

        // Jenis filter
        if ($request->has('jenis') && $request->jenis) {
            $query->where('jenis', $request->jenis);
        }

        $kdDokInouts = $query->orderBy('kd_dok_inout', 'asc')
            ->paginate(15)
            ->through(fn ($item) => [
                'kd_dok_inout' => $item->kd_dok_inout,
                'nm_dok_inout' => $item->nm_dok_inout,
                'jenis' => $item->jenis,
                'keterangan' => $item->keterangan,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/KdDokInout/Index', [
            'kdDokInouts' => [
                'data' => $kdDokInouts->items(),
                'links' => $kdDokInouts->linkCollection()->toArray(),
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
                'jenis' => $request->jenis ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reference/KdDokInout/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kd_dok_inout' => 'required|string|max:10|unique:kd_dok_inout,kd_dok_inout',
            'nm_dok_inout' => 'required|string|max:255',
            'jenis' => 'required|string|in:IN,OUT',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        KdDokInout::create($validated);

        return redirect()->route('reference.kd-dok-inout.index')
            ->with('success', 'Kode dokumen in/out berhasil ditambahkan');
    }

    public function show(KdDokInout $kdDokInout): Response
    {
        return Inertia::render('Reference/KdDokInout/Show', [
            'kdDokInout' => [
                'kd_dok_inout' => $kdDokInout->kd_dok_inout,
                'nm_dok_inout' => $kdDokInout->nm_dok_inout,
                'jenis' => $kdDokInout->jenis,
                'keterangan' => $kdDokInout->keterangan,
                'is_active' => $kdDokInout->is_active,
                'created_at' => $kdDokInout->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $kdDokInout->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(KdDokInout $kdDokInout): Response
    {
        return Inertia::render('Reference/KdDokInout/Edit', [
            'kdDokInout' => [
                'kd_dok_inout' => $kdDokInout->kd_dok_inout,
                'nm_dok_inout' => $kdDokInout->nm_dok_inout,
                'jenis' => $kdDokInout->jenis,
                'keterangan' => $kdDokInout->keterangan,
                'is_active' => $kdDokInout->is_active,
            ],
        ]);
    }

    public function update(Request $request, KdDokInout $kdDokInout): RedirectResponse
    {
        $validated = $request->validate([
            'nm_dok_inout' => 'required|string|max:255',
            'jenis' => 'required|string|in:IN,OUT',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $kdDokInout->update($validated);

        return redirect()->route('reference.kd-dok-inout.index')
            ->with('success', 'Kode dokumen in/out berhasil diperbarui');
    }

    public function destroy(KdDokInout $kdDokInout): RedirectResponse
    {
        try {
            $kdDokInout->delete();

            return redirect()->route('reference.kd-dok-inout.index')
                ->with('success', 'Kode dokumen in/out berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus kode dokumen in/out ini karena masih digunakan oleh data lain',
            ]);
        }
    }
}
