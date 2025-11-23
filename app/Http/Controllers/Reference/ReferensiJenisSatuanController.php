<?php

namespace App\Http\Controllers\Reference;

use App\Http\Controllers\Controller;
use App\Models\ReferensiJenisSatuan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferensiJenisSatuanController extends Controller
{
    public function index()
    {
        $items = ReferensiJenisSatuan::latest()->get();
        return Inertia::render('Reference/JenisSatuan/Index', [
            'items' => $items
        ]);
    }

    public function create()
    {
        return Inertia::render('Reference/JenisSatuan/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_satuan_barang' => 'required|string|unique:referensi_jenis_satuans,kode_satuan_barang',
            'nama_satuan_barang' => 'required|string',
        ]);

        ReferensiJenisSatuan::create($request->all());

        return redirect()->back()->with('success', 'Data berhasil disimpan.');
    }

    public function edit($id)
    {
        $item = ReferensiJenisSatuan::findOrFail($id);
        return Inertia::render('Reference/JenisSatuan/Edit', [
            'item' => $item
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_satuan_barang' => 'required|string|unique:referensi_jenis_satuans,kode_satuan_barang,' . $id,
            'nama_satuan_barang' => 'required|string',
        ]);

        $item = ReferensiJenisSatuan::findOrFail($id);
        $item->update($request->all());

        return redirect()->back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $item = ReferensiJenisSatuan::findOrFail($id);
        $item->delete();

        return redirect()->back()->with('success', 'Data berhasil dihapus.');
    }
}
