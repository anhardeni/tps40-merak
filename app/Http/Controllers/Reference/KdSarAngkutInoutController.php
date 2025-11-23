<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\KdSarAngkutInout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KdSarAngkutInoutController extends Controller
{
    public function index(Request $request): Response
    {
        $query = KdSarAngkutInout::query();

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kd_sar_angkut_inout', 'like', "%{$search}%")
                    ->orWhere('nm_sar_angkut_inout', 'like', "%{$search}%")
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

        $kdSarAngkuts = $query->orderBy('kd_sar_angkut_inout', 'asc')
            ->paginate(15)
            ->through(fn ($item) => [
                'kd_sar_angkut_inout' => $item->kd_sar_angkut_inout,
                'nm_sar_angkut_inout' => $item->nm_sar_angkut_inout,
                'jenis' => $item->jenis,
                'keterangan' => $item->keterangan,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/KdSarAngkutInout/Index', [
            'kdSarAngkuts' => [
                'data' => $kdSarAngkuts->items(),
                'links' => $kdSarAngkuts->linkCollection()->toArray(),
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
        return Inertia::render('Reference/KdSarAngkutInout/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kd_sar_angkut_inout' => 'required|string|max:10|unique:kd_sar_angkut_inout,kd_sar_angkut_inout',
            'nm_sar_angkut_inout' => 'required|string|max:255',
            'jenis' => 'required|string|in:IN,OUT',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        KdSarAngkutInout::create($validated);

        return redirect()->route('kd-sar-angkut-inout.index')
            ->with('success', 'Kode sarana angkut berhasil ditambahkan');
    }

    public function show(KdSarAngkutInout $kdSarAngkutInout): Response
    {
        return Inertia::render('Reference/KdSarAngkutInout/Show', [
            'kdSarAngkut' => [
                'kd_sar_angkut_inout' => $kdSarAngkutInout->kd_sar_angkut_inout,
                'nm_sar_angkut_inout' => $kdSarAngkutInout->nm_sar_angkut_inout,
                'jenis' => $kdSarAngkutInout->jenis,
                'keterangan' => $kdSarAngkutInout->keterangan,
                'is_active' => $kdSarAngkutInout->is_active,
                'created_at' => $kdSarAngkutInout->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $kdSarAngkutInout->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(KdSarAngkutInout $kdSarAngkutInout): Response
    {
        return Inertia::render('Reference/KdSarAngkutInout/Edit', [
            'kdSarAngkut' => [
                'kd_sar_angkut_inout' => $kdSarAngkutInout->kd_sar_angkut_inout,
                'nm_sar_angkut_inout' => $kdSarAngkutInout->nm_sar_angkut_inout,
                'jenis' => $kdSarAngkutInout->jenis,
                'keterangan' => $kdSarAngkutInout->keterangan,
                'is_active' => $kdSarAngkutInout->is_active,
            ],
        ]);
    }

    public function update(Request $request, KdSarAngkutInout $kdSarAngkutInout): RedirectResponse
    {
        $validated = $request->validate([
            'nm_sar_angkut_inout' => 'required|string|max:255',
            'jenis' => 'required|string|in:IN,OUT',
            'keterangan' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $kdSarAngkutInout->update($validated);

        return redirect()->route('reference.kd-sar-angkut-inout.index')
            ->with('success', 'Kode sarana angkut berhasil diperbarui');
    }

    public function destroy(KdSarAngkutInout $kdSarAngkutInout): RedirectResponse
    {
        try {
            $kdSarAngkutInout->delete();

            return redirect()->route('reference.kd-sar-angkut-inout.index')
                ->with('success', 'Kode sarana angkut berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Tidak dapat menghapus kode sarana angkut ini karena masih digunakan oleh data lain',
            ]);
        }
    }
}
