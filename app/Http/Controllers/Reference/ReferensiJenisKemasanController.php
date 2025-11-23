<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\ReferensiJenisKemasan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferensiJenisKemasanController extends Controller
{
    public function index()
    {
        $items = ReferensiJenisKemasan::latest()->get();
        return Inertia::render('Reference/JenisKemasan/Index', [
            'items' => $items
        ]);
    }

    public function create()
    {
        return Inertia::render('Reference/JenisKemasan/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_jenis_kemasan' => 'required|string|unique:referensi_jenis_kemasans,kode_jenis_kemasan',
            'nama_jenis_kemasan' => 'required|string',
        ]);

        ReferensiJenisKemasan::create($request->all());

        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function edit($id)
    {
        $item = ReferensiJenisKemasan::findOrFail($id);
        return Inertia::render('Reference/JenisKemasan/Edit', [
            'item' => $item
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_jenis_kemasan' => 'required|string|unique:referensi_jenis_kemasans,kode_jenis_kemasan,' . $id,
            'nama_jenis_kemasan' => 'required|string',
        ]);

        $item = ReferensiJenisKemasan::findOrFail($id);
        $item->update($request->all());

        return redirect()->back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $item = ReferensiJenisKemasan::findOrFail($id);
        $item->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
