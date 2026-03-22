import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Select } from "@/Components/ui/select"
import { Textarea } from "@/Components/ui/textarea"
import { Plus, Trash2, Save, Download, Send, FileUp, AlertCircle, CheckCircle2, Clock, Info, Package } from "lucide-react"
import { router } from '@inertiajs/react'
import axios from 'axios'
import { ArrowRightLeft, Calendar, LogIn, LogOut } from "lucide-react"

// Document code mapping for context-aware filtering
const DOK_IN_CODES = ['1', '2', '6', '8', '9']
const DOK_OUT_CODES = ['3', '4', '5', '7']

// Validation schema
const documentSchema = z.object({
  kd_dok: z.string().min(1, 'Kode dokumen wajib diisi'),
  kd_tps: z.string().min(1, 'Kode TPS wajib diisi'),
  nm_angkut_id: z.string().min(1, 'Nama angkutan wajib dipilih'),
  kd_gudang: z.string().min(1, 'Kode gudang wajib diisi'),
  no_voy_flight: z.string().optional(),
  tgl_entry: z.string().min(1, 'Tanggal entry wajib diisi'),
  tgl_tiba: z.string().optional(),
  jam_entry: z.string().min(1, 'Jam entry wajib diisi'),
  tgl_gate_in: z.string().optional(),
  jam_gate_in: z.string().optional(),
  tgl_gate_out: z.string().optional(),
  jam_gate_out: z.string().optional(),
  keterangan: z.string().optional(),
  tangki: z.array(z.object({
    no_tangki: z.string().min(1, 'Nomor tangki wajib diisi'),
    seri_out: z.number().optional(),
    no_bl_awb: z.string().optional(),
    tgl_bl_awb: z.string().optional(),
    id_consignee: z.string().optional(),
    consignee: z.string().optional(),
    no_bc11: z.string().optional(),
    tgl_bc11: z.string().optional(),
    no_pos_bc11: z.string().optional(),
    jml_satuan: z.number().optional(),
    jns_satuan: z.string().optional(),
    kd_dok_inout: z.string().optional(),
    no_dok_inout: z.string().optional(),
    tgl_dok_inout: z.string().optional(),
    kd_sar_angkut_inout: z.string().optional(),
    no_pol: z.string().optional(),
    jenis_isi: z.string().min(1, 'Jenis isi wajib diisi'),
    jenis_kemasan: z.string().optional(),
    kapasitas: z.number().min(0, 'Kapasitas harus >= 0'),
    jumlah_isi: z.number().min(0, 'Jumlah isi harus >= 0'),
    satuan: z.string().min(1, 'Satuan wajib diisi'),
    panjang: z.number().optional(),
    lebar: z.number().optional(),
    tinggi: z.number().optional(),
    berat_kosong: z.number().optional(),
    berat_isi: z.number().optional(),
    kondisi: z.string().optional(),
    keterangan: z.string().optional(),
    tgl_produksi: z.string().optional(),
    tgl_expired: z.string().optional(),
    no_segel_bc: z.string().optional(),
    no_segel_perusahaan: z.string().optional(),
    lokasi_penempatan: z.string().optional(),
    wk_inout: z.string().optional(),
    pel_muat: z.string().optional(),
    pel_transit: z.string().optional(),
    pel_bongkar: z.string().optional(),
  })).min(1, 'Minimal harus ada 1 tangki'),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentFormProps {
  document?: any
  referenceData: {
    kdDok: Array<{ kd_dok: string; nm_dok: string }>
    kdTps: Array<{ kd_tps: string; nm_tps: string }>
    nmAngkut: Array<{ id: number; nm_angkut: string; call_sign?: string }>
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string }>
  }
  onSubmit: (data: DocumentFormData) => void
  isLoading?: boolean
}

export function DocumentForm({ document, referenceData, onSubmit, isLoading = false }: DocumentFormProps) {
  const [activeTab, setActiveTab] = useState<'header' | 'tangki' | 'waktu'>('header')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Detect flow type from document data or default to IN
  const [flowType, setFlowType] = useState<'IN' | 'OUT'>(
    document?.tangki?.[0]?.kd_dok_inout === 'OUT' ? 'OUT' : 'IN'
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      kd_dok: document?.kd_dok || '',
      kd_tps: document?.kd_tps || '',
      nm_angkut_id: document?.nm_angkut_id?.toString() || '',
      kd_gudang: document?.kd_gudang || '',
      no_voy_flight: document?.no_voy_flight || '',
      tgl_entry: document?.tgl_entry || new Date().toISOString().split('T')[0],
      tgl_tiba: document?.tgl_tiba || '',
      jam_entry: document?.jam_entry || new Date().toTimeString().slice(0, 8),
      tgl_gate_in: document?.tgl_gate_in || '',
      jam_gate_in: document?.jam_gate_in || '',
      tgl_gate_out: document?.tgl_gate_out || '',
      jam_gate_out: document?.jam_gate_out || '',
      keterangan: document?.keterangan || '',
      tangki: document?.tangki || [
        {
          no_tangki: '',
          seri_out: 0,
          no_bl_awb: '',
          tgl_bl_awb: '',
          id_consignee: '',
          consignee: '',
          no_bc11: '',
          tgl_bc11: '',
          no_pos_bc11: '',
          jml_satuan: 0,
          jns_satuan: '',
          kd_dok_inout: '',
          no_dok_inout: '',
          tgl_dok_inout: '',
          kd_sar_angkut_inout: '',
          no_pol: '',
          jenis_isi: '',
          jenis_kemasan: '',
          kapasitas: 0,
          jumlah_isi: 0,
          satuan: 'LITER',
          panjang: 0,
          lebar: 0,
          tinggi: 0,
          berat_kosong: 0,
          berat_isi: 0,
          kondisi: 'BAIK',
          keterangan: '',
          tgl_produksi: '',
          tgl_expired: '',
          no_segel_bc: '',
          no_segel_perusahaan: '',
          lokasi_penempatan: '',
          wk_inout: '',
          pel_muat: '',
          pel_transit: '',
          pel_bongkar: '',
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tangki"
  })

  const handleFormSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true)
    // Ensure all tangki records have the correct flow type
    const updatedData = {
      ...data,
      tangki: data.tangki.map(t => ({ ...t, kd_dok_inout: flowType }))
    }
    try {
      await onSubmit(updatedData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const setCurrentTime = (field: keyof DocumentFormData) => {
    const now = new Date()
    if (field.startsWith('tgl')) {
      setValue(field, now.toISOString().split('T')[0])
    } else if (field.startsWith('jam')) {
      setValue(field, now.toTimeString().slice(0, 8))
    }
  }

  const filteredKdDok = referenceData.kdDok.filter(d => 
    flowType === 'IN' ? DOK_IN_CODES.includes(d.kd_dok) : DOK_OUT_CODES.includes(d.kd_dok)
  )

  const accentColor = flowType === 'IN' ? 'blue' : 'amber'
  const accentClass = flowType === 'IN' ? 'text-blue-600 border-blue-200' : 'text-amber-600 border-amber-200'
  const ringClass = flowType === 'IN' ? 'focus:ring-blue-500' : 'focus:ring-amber-500'
  const bgAccent = flowType === 'IN' ? 'bg-blue-50' : 'bg-amber-50'

  const addTangki = () => {
    append({
      no_tangki: '',
      no_bl_awb: '',
      tgl_bl_awb: '',
      id_consignee: '',
      consignee: '',
      no_bc11: '',
      tgl_bc11: '',
      no_pos_bc11: '',
      jenis_isi: '',
      jenis_kemasan: '',
      kapasitas: 0,
      jumlah_isi: 0,
      satuan: 'LITER',
      panjang: 0,
      lebar: 0,
      tinggi: 0,
      berat_kosong: 0,
      berat_isi: 0,
      kondisi: 'BAIK',
      keterangan: '',
      tgl_produksi: '',
      tgl_expired: '',
      no_segel_bc: '',
      no_segel_perusahaan: '',
      lokasi_penempatan: '',
      wk_inout: '',
      pel_muat: '',
      pel_transit: '',
      pel_bongkar: '',
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter dark:text-slate-50 uppercase">
            {document ? 'Edit Dokumen' : 'Entry Dokumen Baru'}
          </h1>
          <p className="text-slate-400 mt-2 font-medium flex items-center gap-2 italic">
            <Info className="w-4 h-4" />
            Lengkapi data manifest & pergerakan tangki TPS
          </p>
        </div>

        {/* Compact Flow Selection - iPhone 17 Style */}
        <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200 dark:border-slate-800 min-w-[320px]">
            <button
                type="button"
                onClick={() => setFlowType('IN')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[11px] tracking-widest ${
                flowType === 'IN' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                <LogIn className={`w-4 h-4 ${flowType === 'IN' ? 'animate-pulse' : ''}`} />
                GATE IN
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />
            <button
                type="button"
                onClick={() => setFlowType('OUT')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[11px] tracking-widest ${
                flowType === 'OUT' 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                GATE OUT
                <LogOut className={`w-4 h-4 ${flowType === 'OUT' ? 'animate-pulse' : ''}`} />
            </button>
        </div>
      </div>
        <div className="flex flex-wrap gap-2">
          {document && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => window.open(`/api/export/documents/${document.id}/preview/xml`, '_blank')}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                Preview XML
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                Preview JSON
              </Button>
            </div>
          )}
        </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm border ${
          message.type === 'success' 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}



      {/* Modern Glass Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-4 z-10 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'header' 
              ? `bg-white dark:bg-slate-800 ${flowType === 'IN' ? 'text-blue-600' : 'text-amber-600'} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700` 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Info className="w-4 h-4 mr-2" />
          Informasi Header
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tangki')}
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'tangki' 
              ? `bg-white dark:bg-slate-800 ${flowType === 'IN' ? 'text-blue-600' : 'text-amber-600'} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700` 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Package className="w-4 h-4 mr-2" />
          Daftar Tangki ({fields.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('waktu')}
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            activeTab === 'waktu' 
              ? `bg-white dark:bg-slate-800 ${flowType === 'IN' ? 'text-blue-600' : 'text-amber-600'} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700` 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Pencatatan Waktu
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {activeTab === 'header' && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 border-b p-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" /> General Document Information
                </CardTitle>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kd_dok" className="text-sm font-semibold">Kode Dokumen *</Label>
                  <select
                    {...register('kd_dok')}
                    className={`flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all ${ringClass}`}
                  >
                    <option value="">Pilih Kode Dokumen</option>
                    {filteredKdDok.map((item) => (
                      <option key={item.kd_dok} value={item.kd_dok}>
                        {item.kd_dok} - {item.nm_dok}
                      </option>
                    ))}
                  </select>
                  {errors.kd_dok && <p className="text-xs text-rose-500">{errors.kd_dok.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kd_tps" className="text-sm font-semibold">Kode TPS *</Label>
                  <select
                    {...register('kd_tps')}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all"
                  >
                    <option value="">Pilih Kode TPS</option>
                    {referenceData.kdTps.map((item) => (
                      <option key={item.kd_tps} value={item.kd_tps}>
                        {item.kd_tps} - {item.nm_tps}
                      </option>
                    ))}
                  </select>
                  {errors.kd_tps && <p className="text-xs text-rose-500">{errors.kd_tps.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nm_angkut_id" className="text-sm font-semibold">Nama Angkutan *</Label>
                  <select
                    {...register('nm_angkut_id')}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all"
                  >
                    <option value="">Pilih Nama Angkutan</option>
                    {referenceData.nmAngkut.map((item) => (
                      <option key={item.id} value={item.id.toString()}>
                        {item.nm_angkut} {item.call_sign ? `(${item.call_sign})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.nm_angkut_id && <p className="text-xs text-rose-500">{errors.nm_angkut_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kd_gudang" className="text-sm font-semibold">Kode Gudang *</Label>
                  <select
                    {...register('kd_gudang')}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all"
                  >
                    <option value="">Pilih Kode Gudang</option>
                    {referenceData.kdGudang.map((item) => (
                      <option key={item.kd_gudang} value={item.kd_gudang}>
                        {item.kd_gudang} - {item.nm_gudang}
                      </option>
                    ))}
                  </select>
                  {errors.kd_gudang && <p className="text-xs text-rose-500">{errors.kd_gudang.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_voy_flight" className="text-sm font-semibold">No. VOY/Flight</Label>
                  <Input {...register('no_voy_flight')} placeholder="EX: VOY-123" className="rounded-lg shadow-sm" />
                </div>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="keterangan" className="text-sm font-semibold">Keterangan Dokumen</Label>
                  <Textarea 
                    {...register('keterangan')} 
                    placeholder="Masukkan keterangan detail mengenai pengiriman ini..." 
                    rows={4} 
                    className="rounded-lg shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'tangki' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 text-white flex items-center justify-between p-2 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-1 pl-4">
                <Package className="w-5 h-5 text-indigo-400" />
                <span className="text-[11px] font-black tracking-widest uppercase ml-2">Kontrol Data Tangki</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors px-4"
                  onClick={() => window.open('/documents/template/download', '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </Button>
                
                <Button
                  type="button"
                  className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider px-6 transition-all active:scale-95"
                  onClick={() => window.document.getElementById('excel-import')?.click()}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Import Data
                </Button>

                <div className="w-px h-6 bg-slate-800 mx-1" />

                <Button 
                    type="button" 
                    onClick={addTangki} 
                    className={`h-10 rounded-xl ${flowType === 'IN' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'} text-white text-[10px] font-black uppercase tracking-wider px-6 transition-all active:scale-95 shadow-lg ${flowType === 'IN' ? 'shadow-blue-500/20' : 'shadow-amber-500/20'}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Baris
                </Button>

                <input
                  id="excel-import"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const response = await axios.post('/documents/import', formData);
                      if (response.data.success) {
                        const importedData = response.data.data;
                        const newTangki = importedData.map((row: any) => ({
                          no_tangki: row.no_tangki || '',
                          jenis_isi: row.jenis_isi || '',
                          kapasitas: parseFloat(row.kapasitas) || 0,
                          jumlah_isi: parseFloat(row.jumlah_isi) || 0,
                          satuan: row.satuan || 'LITER',
                          no_bl_awb: row.no_bl_awb || '',
                          tgl_bl_awb: row.tgl_bl_awb || '',
                          consignee: row.consignee || '',
                          no_bc11: row.no_bc11 || '',
                          tgl_bc11: row.tgl_bc11 || '',
                          kondisi: row.kondisi || 'BAIK',
                        }));
                        setValue('tangki', newTangki);
                        setMessage({ type: 'success', text: `Berhasil mengimport ${newTangki.length} data tangki.` });
                        setTimeout(() => setMessage(null), 5000);
                      }
                    } catch (error: any) {
                      setMessage({ type: 'error', text: error.response?.data?.error || 'Gagal mengimport data' });
                      setTimeout(() => setMessage(null), 5000);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              {fields.map((field: any, index: number) => (
                <Card key={field.id} className="overflow-hidden border-slate-200 shadow-sm group hover:border-blue-300 transition-all duration-300">
                  <div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800">
                        {index + 1}
                      </div>
                      <span className="text-sm font-bold tracking-wide">TANGKI DETAIL</span>
                    </div>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full p-2 h-auto" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. Tangki *</Label>
                      <Input {...register(`tangki.${index}.no_tangki` as const)} className="rounded-lg bg-slate-50/50 focus:bg-white" />
                      {errors.tangki?.[index]?.no_tangki && <p className="text-[11px] text-rose-500 font-medium">{errors.tangki[index].no_tangki.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Jenis Isi *</Label>
                      <Input {...register(`tangki.${index}.jenis_isi` as const)} className="rounded-lg bg-slate-50/50 focus:bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Kapasitas</Label>
                      <Input type="number" step="0.001" {...register(`tangki.${index}.kapasitas` as const, { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })} className="rounded-lg shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Jumlah Isi</Label>
                      <Input type="number" step="0.001" {...register(`tangki.${index}.jumlah_isi` as const, { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })} className="rounded-lg shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Satuan</Label>
                      <select {...register(`tangki.${index}.satuan` as const)} className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                        <option value="LITER">LITER</option>
                        <option value="KGM">KGM</option>
                        <option value="M3">M3</option>
                        <option value="TON">TON</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Kondisi</Label>
                      <select {...register(`tangki.${index}.kondisi` as const)} className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                        <option value="BAIK">BAIK</option>
                        <option value="RUSAK">RUSAK</option>
                        <option value="BOCOR">BOCOR</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. BL/AWB</Label>
                      <Input {...register(`tangki.${index}.no_bl_awb` as const)} className={`rounded-lg ${ringClass}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. BC11</Label>
                      <Input {...register(`tangki.${index}.no_bc11` as const)} className={`rounded-lg ${ringClass}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. Polisi (Truck)</Label>
                      <Input {...register(`tangki.${index}.no_pol` as const)} className={`rounded-lg ${ringClass}`} placeholder="EX: B 1234 ABC" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Sarana Angkut</Label>
                      <select {...register(`tangki.${index}.kd_sar_angkut_inout` as const)} className={`flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:ring-2 transition-all ${ringClass}`}>
                        <option value="LAND">DARAT (TRUK)</option>
                        <option value="SEA">LAUT (KAPAL)</option>
                        <option value="PIPE">PIPA</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'waktu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${flowType === 'IN' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className={`${bgAccent}/50 dark:bg-slate-900 border-b p-4`}>
                <CardTitle className={`text-lg font-bold flex items-center justify-between gap-2 ${accentClass.split(' ')[0]}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Entry & Kedatangan
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setCurrentTime('tgl_entry'); 
                        setCurrentTime('jam_entry');
                    }}
                    className="text-[10px] uppercase font-bold tracking-tighter"
                  >
                    Set Now
                  </Button>
                </CardTitle>
              </div>
              <CardContent className="p-6 grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tgl. Entry *</Label>
                    <Input type="date" {...register('tgl_entry')} className={`rounded-lg ${ringClass}`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Jam. Entry *</Label>
                    <Input type="time" {...register('jam_entry')} className={`rounded-lg ${ringClass}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tanggal Tiba (Estimasi)</Label>
                  <div className="flex gap-2">
                    <Input type="date" {...register('tgl_tiba')} className={`rounded-lg flex-1 ${ringClass}`} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setCurrentTime('tgl_tiba')} className="shrink-0"><Calendar className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${flowType === 'IN' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className={`${bgAccent}/50 dark:bg-slate-900 border-b p-4`}>
                <CardTitle className={`text-lg font-bold flex items-center gap-2 ${accentClass.split(' ')[0]}`}>
                  <Send className="w-5 h-5" /> Aktivitas Gate
                </CardTitle>
              </div>
              <CardContent className="p-6 space-y-8">
                {flowType === 'IN' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">GATE IN</div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setCurrentTime('tgl_gate_in'); 
                                setCurrentTime('jam_gate_in');
                            }}
                            className="text-[10px] uppercase font-bold"
                        >Set Now</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Tgl. Gate In</Label>
                        <Input type="date" {...register('tgl_gate_in')} className={`rounded-lg ${ringClass}`} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Jam. Gate In</Label>
                        <Input type="time" {...register('jam_gate_in')} className={`rounded-lg ${ringClass}`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">GATE OUT</div>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setCurrentTime('tgl_gate_out'); 
                                setCurrentTime('jam_gate_out');
                            }}
                            className="text-[10px] uppercase font-bold"
                        >Set Now</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Tgl. Gate Out</Label>
                        <Input type="date" {...register('tgl_gate_out')} className={`rounded-lg ${ringClass}`} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Jam. Gate Out</Label>
                        <Input type="time" {...register('jam_gate_out')} className={`rounded-lg ${ringClass}`} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-6">
          <div className="flex gap-3">
            {activeTab === 'header' && (
              <Button type="button" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8" onClick={() => setActiveTab('tangki')}>
                Lanjut ke Tangki
              </Button>
            )}
            {activeTab === 'tangki' && (
              <>
                <Button type="button" size="lg" variant="ghost" onClick={() => setActiveTab('header')} className="rounded-xl px-8">Kembali</Button>
                <Button type="button" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8" onClick={() => setActiveTab('waktu')}>Lanjut ke Waktu</Button>
              </>
            )}
            {activeTab === 'waktu' && (
              <Button type="button" size="lg" variant="ghost" onClick={() => setActiveTab('tangki')} className="rounded-xl px-8">Kembali</Button>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button type="button" size="lg" variant="outline" onClick={() => router.get('/documents')} disabled={isSubmitting} className="flex-1 md:flex-none rounded-xl">
              Batal
            </Button>
            <Button type="submit" size="lg" className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 px-10" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Simpan Dokumen
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}