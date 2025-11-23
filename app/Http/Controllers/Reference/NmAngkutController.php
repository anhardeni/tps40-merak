<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\NmAngkut;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NmAngkutController extends Controller
{
    public function index(Request $request): Response
    {
        $query = NmAngkut::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('nm_angkut', 'like', "%{$search}%")
                ->orWhere('call_sign', 'like', "%{$search}%")
                ->orWhere('jenis_angkutan', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $items = $query->orderBy('id', 'desc')
            ->paginate(15)
            ->through(fn ($item) => [
                'id' => $item->id,
                'nm_angkut' => $item->nm_angkut,
                'call_sign' => $item->call_sign,
                'jenis_angkutan' => $item->jenis_angkutan,
                'bendera' => $item->bendera,
                'is_active' => $item->is_active,
                'created_at' => $item->created_at?->format('Y-m-d H:i'),
                'updated_at' => $item->updated_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Reference/NmAngkut/Index', [
            'nmAngkut' => [
                'data' => $items->items(),
                'meta' => [
                    'current_page' => $items->currentPage(),
                    'from' => $items->firstItem(),
                    'last_page' => $items->lastPage(),
                    'per_page' => $items->perPage(),
                    'to' => $items->lastItem(),
                    'total' => $items->total(),
                ],
                'links' => [
                    'first' => $items->url(1),
                    'last' => $items->url($items->lastPage()),
                    'prev' => $items->previousPageUrl(),
                    'next' => $items->nextPageUrl(),
                ],
            ],
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Reference/NmAngkut/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nm_angkut' => 'required|string|max:100',
            'call_sign' => 'nullable|string|max:50',
            'jenis_angkutan' => 'nullable|string|max:20',
            'bendera' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        NmAngkut::create($validated);

        return redirect()->route('nm-angkut.index')->with('success', 'Nama angkutan berhasil ditambahkan');
    }

    public function show(NmAngkut $nmAngkut): Response
    {
        return Inertia::render('Reference/NmAngkut/Show', [
            'nmAngkut' => [
                'id' => $nmAngkut->id,
                'nm_angkut' => $nmAngkut->nm_angkut,
                'call_sign' => $nmAngkut->call_sign,
                'jenis_angkutan' => $nmAngkut->jenis_angkutan,
                'bendera' => $nmAngkut->bendera,
                'is_active' => $nmAngkut->is_active,
                'created_at' => $nmAngkut->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $nmAngkut->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function edit(NmAngkut $nmAngkut): Response
    {
        return Inertia::render('Reference/NmAngkut/Edit', [
            'nmAngkut' => [
                'id' => $nmAngkut->id,
                'nm_angkut' => $nmAngkut->nm_angkut,
                'call_sign' => $nmAngkut->call_sign,
                'jenis_angkutan' => $nmAngkut->jenis_angkutan,
                'bendera' => $nmAngkut->bendera,
                'is_active' => $nmAngkut->is_active,
            ],
        ]);
    }

    public function update(Request $request, NmAngkut $nmAngkut): RedirectResponse
    {
        $validated = $request->validate([
            'nm_angkut' => 'required|string|max:100',
            'call_sign' => 'nullable|string|max:50',
            'jenis_angkutan' => 'nullable|string|max:20',
            'bendera' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $nmAngkut->update($validated);

        return redirect()->route('nm-angkut.index')->with('success', 'Nama angkutan berhasil diperbarui');
    }

    public function destroy(NmAngkut $nmAngkut): RedirectResponse
    {
        try {
            $nmAngkut->delete();

            return redirect()->route('nm-angkut.index')->with('success', 'Nama angkutan berhasil dihapus');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus data karena masih digunakan']);
        }
    }
}
