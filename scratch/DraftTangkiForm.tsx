// Draft redesigned UI for DocumentForm.tsx
// This file contains the updated JSX structure for the Tangki Detail section.

// ... (existing imports and logic)

// Inside the fields.map loop:
<Card key={field.id} className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${flowType === 'IN' ? 'border-l-blue-500' : 'border-l-amber-500'} mb-8`}>
  {/* HEADER CARD: Identitas Utama & Tombol Hapus */}
  <div className="bg-slate-50 dark:bg-slate-900/50 border-b px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${flowType === 'IN' ? 'bg-blue-600 shadow-blue-200' : 'bg-amber-500 shadow-amber-200'} text-white flex items-center justify-center font-black text-sm shadow-lg`}>
        {index + 1}
      </div>
      <div>
        <h3 className="text-sm font-black tracking-widest uppercase">Detail Tangki #{index + 1}</h3>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Informasi muatan dan perijinan pabean</p>
      </div>
    </div>
    {fields.length > 1 && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl px-3 py-1.5 h-auto text-[10px] font-bold uppercase tracking-wider"
        onClick={() => remove(index)}
      >
        <Trash2 className="w-4 h-4 mr-2" /> Hapus Baris
      </Button>
    )}
  </div>

  <CardContent className="p-0">
    <div className="flex flex-col">
      
      {/* GROUP 1: IDENTITAS & KONDISI FISIK */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Identification & Condition</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">No. Tangki *</Label>
            <Input list={`tangkis-${index}`} {...register(`tangki.${index}.no_tangki` as const)} className="h-10 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-indigo-500" placeholder="Pilih atau ketik..." />
            {errors.tangki?.[index]?.no_tangki && <p className="text-[10px] text-rose-500 font-bold">{errors.tangki[index].no_tangki.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Seri Out (Auto)</Label>
            <Input type="number" value={watch('tangki')?.slice(0, index + 1).filter((t: any) => t.no_bl_awb && t.no_bl_awb === watch(`tangki.${index}.no_bl_awb`) && t.tgl_bl_awb === watch(`tangki.${index}.tgl_bl_awb`)).length || 1} readOnly className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono font-bold border-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Jenis Isi *</Label>
            <Input {...register(`tangki.${index}.jenis_isi` as const)} className="h-10 rounded-xl bg-slate-50/50" placeholder="Contoh: Crude Oil" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Jenis Kemasan</Label>
            <Input {...register(`tangki.${index}.jenis_kemasan` as const)} className="h-10 rounded-xl bg-slate-50/50" placeholder="Contoh: BULK" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Kondisi Fisik</Label>
            <select {...register(`tangki.${index}.kondisi` as const)} className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-indigo-500">
              <option value="BAIK">BAIK</option>
              <option value="RUSAK">RUSAK</option>
              <option value="BOCOR">BOCOR</option>
            </select>
          </div>
        </div>
      </div>

      {/* GROUP 2: DOKUMEN PABEAN & PENERIMA */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Customs & Consignee</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">No. BC11 / Tgl / Pos</Label>
            <div className="flex gap-2">
              <Input {...register(`tangki.${index}.no_bc11` as const)} placeholder="No BC11" className="h-10 rounded-xl flex-1" />
              <Input type="date" {...register(`tangki.${index}.tgl_bc11` as const)} className="h-10 rounded-xl w-32 text-[10px]" />
              <Input {...register(`tangki.${index}.no_pos_bc11` as const)} placeholder="POS" className="h-10 rounded-xl w-20 text-center text-xs font-bold" />
            </div>
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">No. BL/AWB & Tanggal</Label>
            <div className="flex gap-2">
              <Input {...register(`tangki.${index}.no_bl_awb` as const)} placeholder="Nomor B/L" className="h-10 rounded-xl flex-1" />
              <Input type="date" {...register(`tangki.${index}.tgl_bl_awb` as const)} className="h-10 rounded-xl w-32 text-[10px]" />
            </div>
          </div>
          <div className="md:col-span-6 space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Consignee (Penerima) *</Label>
            <div className="flex gap-2">
              <Input {...register(`tangki.${index}.consignee` as const)} placeholder="Nama Lengkap Perusahaan" className={`h-10 rounded-xl flex-1 ${errors.tangki?.[index]?.consignee ? 'border-rose-500' : ''}`} />
              <div className="relative flex-1 max-w-[200px]">
                <Input {...register(`tangki.${index}.id_consignee` as const)} placeholder="NPWP / ID" className="h-10 rounded-xl font-mono text-xs pl-8" />
                <span className="absolute left-3 top-3 text-[10px] font-bold text-slate-400">ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GROUP 3: LOGISTIK & TRANSPORTASI */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-500">Logistics & Transit</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">No. Polisi (Truk)</Label>
            <Input {...register(`tangki.${index}.no_pol` as const)} placeholder="B 1234 ABC" className="h-10 rounded-xl font-black text-center" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Waktu In / Out</Label>
            <Input type="datetime-local" {...register(`tangki.${index}.wk_inout` as const)} className="h-10 rounded-xl text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Dokumen Lalin</Label>
            <div className="flex gap-2">
              <select {...register(`tangki.${index}.kd_dok_inout` as const)} className="h-10 rounded-xl border border-slate-200 text-[10px] font-bold w-20">
                {filteredKdDokInout.map(item => <option key={item.kd_dok_inout} value={item.kd_dok_inout}>{item.kd_dok_inout}</option>)}
              </select>
              <Input {...register(`tangki.${index}.no_dok_inout` as const)} placeholder="Nomor Dok" className="h-10 rounded-xl flex-1 text-xs" />
              <Input type="date" {...register(`tangki.${index}.tgl_dok_inout` as const)} className="h-10 rounded-xl w-28 text-[9px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Mode Transport</Label>
            <select {...register(`tangki.${index}.kd_sar_angkut_inout` as const)} className="h-10 w-full rounded-xl border border-slate-200 text-xs font-bold px-3">
              <option value="1">1 - DARAT (TRUK)</option>
              <option value="3">3 - LAUT (KAPAL)</option>
              <option value="7">7 - PIPA</option>
              <option value="4">4 - UDARA</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Kapasitas / Isi</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.001" {...register(`tangki.${index}.kapasitas` as const)} placeholder="Kaps" className="h-10 rounded-xl flex-1 text-xs" />
              <Input type="number" step="0.001" {...register(`tangki.${index}.jumlah_isi` as const)} placeholder="Isi" className="h-10 rounded-xl flex-1 text-xs border-indigo-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Volume & Satuan *</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.001" {...register(`tangki.${index}.jml_satuan` as const)} className="h-10 rounded-xl flex-1 font-bold" />
              <select {...register(`tangki.${index}.satuan` as const)} className="h-10 rounded-xl border border-slate-200 text-xs font-black w-24">
                <option value="LTR">LITER</option>
                <option value="KGM">KGM</option>
                <option value="TNE">TNE</option>
              </select>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-tight">Alur Pelabuhan (Muat | Transit | Bongkar)</Label>
            <div className="flex gap-2">
              <Input {...register(`tangki.${index}.pel_muat` as const)} placeholder="MUAT" className="h-10 rounded-xl flex-1 text-center font-bold text-xs" />
              <Input {...register(`tangki.${index}.pel_transit` as const)} placeholder="TRANSIT" className="h-10 rounded-xl flex-1 text-center font-bold text-xs" />
              <Input {...register(`tangki.${index}.pel_bongkar` as const)} placeholder="BONGKAR" className="h-10 rounded-xl flex-1 text-center font-black text-xs bg-indigo-50/50" />
            </div>
          </div>
        </div>
      </div>

      {/* GROUP 4: PERMIT & TECHNICAL DETAILS */}
      <div className="p-6 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Ijin TPS (Highlight) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-sm rotate-45" /> Ijin TPS (SP2 / KARTU EKSPOR)
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">Nomor Dokumen Ijin</Label>
                <Input {...register(`tangki.${index}.no_dok_ijin_tps` as const)} className="h-10 rounded-xl border-blue-200 focus:border-blue-500" placeholder="KEP-..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">Tanggal Ijin</Label>
                <Input type="date" {...register(`tangki.${index}.tgl_dok_ijin_tps` as const)} className="h-10 rounded-xl border-blue-200 focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase">Lokasi Penempatan</Label>
                  <Input {...register(`tangki.${index}.lokasi_penempatan` as const)} placeholder="KODE AREA / BLOK" className="h-10 rounded-xl" />
               </div>
               <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase">Keterangan Tambahan</Label>
                  <Input {...register(`tangki.${index}.keterangan` as const)} className="h-10 rounded-xl" />
               </div>
            </div>
          </div>

          {/* Technical: Dimensi & Segel */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Dimensi Tangki (Meter)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input type="number" step="0.01" {...register(`tangki.${index}.panjang` as const)} placeholder="P" className="h-10 rounded-xl text-center font-bold" />
                  <span className="text-[8px] text-center block mt-1 text-slate-400">PANJANG</span>
                </div>
                <div className="flex-1">
                  <Input type="number" step="0.01" {...register(`tangki.${index}.lebar` as const)} placeholder="L" className="h-10 rounded-xl text-center font-bold" />
                  <span className="text-[8px] text-center block mt-1 text-slate-400">LEBAR</span>
                </div>
                <div className="flex-1">
                  <Input type="number" step="0.01" {...register(`tangki.${index}.tinggi` as const)} placeholder="T" className="h-10 rounded-xl text-center font-bold" />
                  <span className="text-[8px] text-center block mt-1 text-slate-400">TINGGI</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">Segel Beacukai</Label>
                <Input {...register(`tangki.${index}.no_segel_bc` as const)} className="h-9 rounded-xl border-slate-200 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold text-slate-400 uppercase">Segel Perusahaan</Label>
                <Input {...register(`tangki.${index}.no_segel_perusahaan` as const)} className="h-9 rounded-xl border-slate-200 text-xs" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </CardContent>
</Card>
