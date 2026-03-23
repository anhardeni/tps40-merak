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
import { router, usePage } from '@inertiajs/react'
import axios from 'axios'
import { ArrowRightLeft, Calendar, LogIn, LogOut } from "lucide-react"
import GradientButton from "@/Components/ui/gradient-button";

// Document code mapping for context-aware filtering
const DOK_IN_CODES = ['1', '2', '6', '8', '9']
const DOK_OUT_CODES = ['3', '4', '5', '7']

// Human readable labels for error mapping
const FIELD_LABELS: Record<string, string> = {
  kd_dok: 'Kode Dokumen',
  kd_tps: 'Kode TPS',
  nm_angkut_id: 'Nama Angkutan',
  kd_gudang: 'Gudang',
  no_voy_flight: 'No. Voy/Flight',
  tgl_entry: 'Tgl. Entry',
  jam_entry: 'Jam Entry',
  tgl_tiba: 'Tgl. Tiba',
  tgl_gate_in: 'Tgl. Gate In',
  jam_gate_in: 'Jam. Gate In',
  tgl_gate_out: 'Tgl. Gate Out',
  jam_gate_out: 'Jam. Gate Out',
  no_tangki: 'No. Tangki',
  jenis_isi: 'Jenis Isi',
  kapasitas: 'Kapasitas',
  jumlah_isi: 'Jml. Isi',
  satuan: 'Satuan',
  kd_dok_inout: 'Kd. Dok Lalin',
  no_dok_inout: 'No. Dok Lalin',
  tgl_dok_inout: 'Tgl. Dok Lalin',
  kd_sar_angkut_inout: 'Sarana Angkut',
  jns_satuan: 'Jenis Satuan',
  jml_satuan: 'Jml. Satuan',
}

// Validation schema
const documentSchema = z.object({
  kd_dok: z.string().min(1, 'Kode dokumen wajib diisi'),
  kd_tps: z.string().min(1, 'Kode TPS wajib diisi'),
  nm_angkut_id: z.string().min(1, 'Nama angkutan wajib dipilih'),
  kd_gudang: z.string().min(1, 'Kode gudang wajib diisi'),
  no_voy_flight: z.string().min(1, 'No. Voy/Flight wajib diisi'),
  tgl_entry: z.string().min(1, 'Tanggal entry wajib diisi'),
  tgl_tiba: z.string().min(1, 'Tanggal tiba wajib diisi'),
  jam_entry: z.string().min(1, 'Jam entry wajib diisi'),
  tgl_gate_in: z.string().optional(),
  jam_gate_in: z.string().optional(),
  tgl_gate_out: z.string().optional(),
  jam_gate_out: z.string().optional(),
  keterangan: z.string().optional(),
  tangki: z.array(z.object({
    no_tangki: z.string().min(1, 'Nomor tangki wajib diisi'),
    seri_out: z.coerce.number().optional(),
    no_bl_awb: z.string().optional(),
    tgl_bl_awb: z.string().optional(),
    id_consignee: z.string().optional(),
    consignee: z.string().optional(),
    no_bc11: z.string().optional(),
    tgl_bc11: z.string().optional(),
    no_pos_bc11: z.string().optional(),
    jml_satuan: z.coerce.number().optional(),
    jns_satuan: z.string().optional(),
    kd_dok_inout: z.string().optional(),
    no_dok_inout: z.string().optional(),
    tgl_dok_inout: z.string().optional(),
    kd_sar_angkut_inout: z.string().optional(),
    no_pol: z.string().optional(),
    jenis_isi: z.string().min(1, 'Jenis isi wajib diisi'),
    jenis_kemasan: z.string().optional(),
    kapasitas: z.coerce.number().min(0, 'Kapasitas harus >= 0'),
    jumlah_isi: z.coerce.number().min(0, 'Jumlah isi harus >= 0'),
    satuan: z.string().min(1, 'Satuan wajib diisi'),
    panjang: z.coerce.number().optional(),
    lebar: z.coerce.number().optional(),
    tinggi: z.coerce.number().optional(),
    berat_kosong: z.coerce.number().optional(),
    berat_isi: z.coerce.number().optional(),
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
    no_dok_ijin_tps: z.string().optional(),
    tgl_dok_ijin_tps: z.string().optional(),
  })).min(1, 'Minimal harus ada 1 tangki'),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentFormProps {
  document?: any
  referenceData: {
    kdDok: Array<{ kd_dok: string; nm_dok: string }>
    kdTps: Array<{ kd_tps: string; nm_tps: string }>
    nmAngkut: Array<{ id: number; nm_angkut: string; call_sign?: string }>
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string; kd_tps?: string }>
    kdDokInout: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis: string }>
  }
  onSubmit: (data: DocumentFormData) => void
  isLoading?: boolean
}

export function DocumentForm({ document, referenceData, onSubmit, isLoading = false }: DocumentFormProps) {
  const [activeTab, setActiveTab] = useState<'header' | 'tangki' | 'waktu'>('header')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const { props } = usePage()
  const serverErrors = props.errors as any

  // Detect flow type from document data or default to IN
  const [flowType, setFlowType] = useState<'IN' | 'OUT'>(
    (() => {
      const firstTangkiCode = document?.tangki?.[0]?.kd_dok_inout;
      if (DOK_OUT_CODES.includes(firstTangkiCode)) return 'OUT';
      if (DOK_IN_CODES.includes(firstTangkiCode)) return 'IN';
      return document?.tangki?.[0]?.kd_dok_inout === 'OUT' ? 'OUT' : 'IN';
    })()
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
          seri_out: 1,
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
          no_dok_ijin_tps: '',
          tgl_dok_ijin_tps: '',
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
      tangki: data.tangki.map(t => ({
        ...t,
        kd_dok_inout: t.kd_dok_inout || data.kd_dok
      }))
    }
    try {
      await onSubmit(updatedData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDummyData = () => {
    // Select first options from filtered lists
    const firstDok = filteredKdDok[0]?.kd_dok || '';
    const firstTps = referenceData.kdTps[0]?.kd_tps || '';
    const firstAngkut = referenceData.nmAngkut[0]?.id.toString() || '';
    const firstGudang = referenceData.kdGudang.find(g => g.kd_tps === firstTps)?.kd_gudang || referenceData.kdGudang[0]?.kd_gudang || '';
    const firstDokInout = filteredKdDokInout[0]?.kd_dok_inout || firstDok || '';

    setValue('kd_dok', firstDok);
    setValue('kd_tps', firstTps);
    setValue('nm_angkut_id', firstAngkut);
    setValue('kd_gudang', firstGudang);
    setValue('no_voy_flight', 'DUMMY-VOY-' + Math.floor(Math.random() * 999));
    setValue('tgl_tiba', new Date().toISOString().split('T')[0]);
    setValue('keterangan', 'DUMMY DATA FOR TESTING PURPOSES');

    const dummyTangki = [
      {
        no_tangki: 'TNK-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
        seri_out: 1,
        jenis_isi: 'PREMIUM GASOLINE',
        kapasitas: 25000,
        jumlah_isi: 20000,
        satuan: 'LITER',
        kondisi: 'BAIK',
        no_bl_awb: 'BL-DUMMY-' + Math.floor(Math.random() * 1000),
        tgl_bl_awb: new Date().toISOString().split('T')[0],
        consignee: 'PT TEST DATA SEJAHTERA',
        id_consignee: '12.345.678.9-123.000',
        no_bc11: '000123',
        tgl_bc11: new Date().toISOString().split('T')[0],
        no_pos_bc11: '0001',
        kd_dok_inout: firstDokInout,
        no_dok_inout: 'DUM-LALIN-001',
        tgl_dok_inout: new Date().toISOString().split('T')[0],
        kd_sar_angkut_inout: 'LAND',
        no_pol: 'B 1234 TEST',
        jenis_kemasan: 'BULK',
        jml_satuan: 1,
        jns_satuan: 'DRM',
        panjang: 6,
        lebar: 2.5,
        tinggi: 2.5,
        berat_kosong: 6000,
        berat_isi: 26000,
        keterangan: 'DUMMY TESTING',
        tgl_produksi: new Date().toISOString().split('T')[0],
        tgl_expired: new Date().toISOString().split('T')[0],
        no_segel_bc: 'BC-001',
        no_segel_perusahaan: 'PR-001',
        lokasi_penempatan: 'ZONE-A1',
        wk_inout: new Date().toISOString().slice(0, 16),
        pel_muat: 'IDTPP',
        pel_transit: 'IDTPP',
        pel_bongkar: 'IDTPP',
        no_dok_ijin_tps: 'IJIN-001',
        tgl_dok_ijin_tps: new Date().toISOString().split('T')[0],
      }
    ];
    setValue('tangki', dummyTangki);
    setMessage({ type: 'success', text: 'Form populated with dummy data!' });
    setTimeout(() => setMessage(null), 3000);
  };

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

  const filteredKdDokInout = referenceData.kdDokInout.filter(d => d.jenis === flowType)

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
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[11px] tracking-widest ${flowType === 'IN'
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
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[11px] tracking-widest ${flowType === 'OUT'
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

      {(message || (serverErrors && Object.keys(serverErrors).length > 0) || (errors && Object.keys(errors).length > 0)) && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm border ${message?.type === 'success'
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-rose-50 text-rose-800 border-rose-200"
          }`}>
          {(message?.type === 'success') ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <div className="flex flex-col gap-1">
            {message && <span className="text-sm font-bold border-b border-rose-200 pb-1 mb-1">{message.text}</span>}

            {/* Server Errors (Backend) */}
            {serverErrors && Object.entries(serverErrors).map(([key, value]) => {
              const label = FIELD_LABELS[key] || key;
              return (
                <div key={`server-${key}`} className="flex items-start gap-2 text-xs">
                  <span className="font-bold min-w-[100px] text-rose-600">Terjadi Error:</span>
                  <span className="font-medium text-rose-700">{label}: {value as string}</span>
                </div>
              );
            })}

            {/* Frontend Validation Errors (Zod) */}
            {errors && Object.entries(errors).map(([key, error]: [string, any]) => {
              if (key === 'tangki' && Array.isArray(error)) {
                return error.flatMap((t, idx) =>
                  Object.entries(t || {}).map(([field, fieldError]: [string, any]) => {
                    const label = FIELD_LABELS[field] || field;
                    return (
                      <div key={`form-tangki-${idx}-${field}`} className="flex items-start gap-2 text-xs">
                        <span className="font-bold min-w-[100px] text-rose-600">Tangki #{idx + 1}:</span>
                        <span className="font-medium uppercase text-rose-700">{label} - {fieldError.message}</span>
                      </div>
                    )
                  })
                )
              }
              const label = FIELD_LABELS[key] || key;
              return (
                <div key={`form-${key}`} className="flex items-start gap-2 text-xs">
                  <span className="font-bold min-w-[100px] text-rose-600">Form Header:</span>
                  <span className="font-medium uppercase text-rose-700">{label} - {error.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Modern Glass Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-4 z-10 backdrop-blur-md shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'header'
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
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'tangki'
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
          className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'waktu'
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
            <Card className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${flowType === 'IN' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className="bg-slate-50 dark:bg-slate-900 border-b p-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className={`w-5 h-5 ${flowType === 'IN' ? 'text-blue-500' : 'text-amber-500'}`} /> General Document Information
                </CardTitle>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kd_dok" className="text-sm font-semibold">Kode Dokumen *</Label>
                  <select
                    {...register('kd_dok')}
                    className={`flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-2 text-sm focus:ring-2 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all ${ringClass}`}
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
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all"
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
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 shadow-sm transition-all"
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
                  <Label className="text-sm font-semibold italic text-slate-500">Call Sign</Label>
                  <div className="h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 font-mono">
                    {(() => {
                      const selectedId = watch('nm_angkut_id');
                      const selectedAngkut = referenceData.nmAngkut.find(item => item.id.toString() === selectedId);
                      return selectedAngkut?.call_sign || '-';
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="no_voy_flight" className="text-sm font-semibold">No. VOY/Flight *</Label>
                  <Input {...register('no_voy_flight')} placeholder="EX: VOY-123" className="rounded-lg shadow-sm" />
                  {errors.no_voy_flight && <p className="text-xs text-rose-500">{errors.no_voy_flight.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tanggal Tiba (Estimasi) *</Label>
                  <div className="flex gap-2">
                    <Input type="date" {...register('tgl_tiba')} className={`rounded-lg flex-1 ${ringClass}`} />
                    <Button type="button" size="icon" variant="outline" onClick={() => setCurrentTime('tgl_tiba')} className="shrink-0"><Calendar className="w-4 h-4" /></Button>
                  </div>
                  {errors.tgl_tiba && <p className="text-xs text-rose-500">{errors.tgl_tiba.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="keterangan" className="text-sm font-semibold">Keterangan Dokumen</Label>
                  <Textarea
                    {...register('keterangan')}
                    placeholder="Masukkan keterangan detail mengenai pengiriman ini..."
                    rows={2}
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
                  variant="outline"
                  className="h-10 text-[10px] font-black uppercase tracking-wider text-rose-500 border-rose-200 hover:bg-rose-50 transition-all px-4 rounded-xl"
                  onClick={fillDummyData}
                >
                  Testing (Fill Dummy)
                </Button>

                <GradientButton
                  label="Template"
                  href="/documents/template/download"
                  target="_blank"
                />


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
                <Card key={field.id} className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${flowType === 'IN' ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
                  <div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${flowType === 'IN' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-800 transition-colors duration-300 shadow-sm`}>
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
                    {/* Basic Info */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. Tangki *</Label>
                      <Input {...register(`tangki.${index}.no_tangki` as const)} className="rounded-lg bg-slate-50/50 focus:bg-purple-500" />
                      {errors.tangki?.[index]?.no_tangki && <p className="text-[11px] text-rose-500 font-medium">{errors.tangki[index].no_tangki.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Seri Out (Lalin)</Label>
                      <Input type="number" {...register(`tangki.${index}.seri_out` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Jenis Isi *</Label>
                      <Input {...register(`tangki.${index}.jenis_isi` as const)} className="rounded-lg bg-slate-50/50 focus:bg-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Kondisi</Label>
                      <select {...register(`tangki.${index}.kondisi` as const)} className="flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                        <option value="BAIK">BAIK</option>
                        <option value="RUSAK">RUSAK</option>
                        <option value="BOCOR">BOCOR</option>
                      </select>
                    </div>

                    {/* Capacity Row */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Kapasitas</Label>
                      <Input type="number" step="0.001" {...register(`tangki.${index}.kapasitas` as const, { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })} className="rounded-lg shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Jumlah Isi</Label>
                      <Input type="number" step="0.001" {...register(`tangki.${index}.jumlah_isi` as const, { setValueAs: (v) => v === '' ? 0 : parseFloat(v) })} className="rounded-lg shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Satuan Utama</Label>
                      <select {...register(`tangki.${index}.satuan` as const)} className="flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                        <option value="LITER">LITER</option>
                        <option value="KGM">KGM</option>
                        <option value="M3">M3</option>
                        <option value="TON">TON</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Jml Satuan</Label>
                        <Input type="number" step="0.001" {...register(`tangki.${index}.jml_satuan` as const)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Jenis Sat</Label>
                        <Input {...register(`tangki.${index}.jns_satuan` as const)} className="h-8 text-xs" placeholder="BOX/DRM" />
                      </div>
                    </div>

                    {/* Shipments & Customs */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. BL/AWB</Label>
                      <Input {...register(`tangki.${index}.no_bl_awb` as const)} className={`rounded-lg ${ringClass}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Tgl. BL/AWB</Label>
                      <Input type="date" {...register(`tangki.${index}.tgl_bl_awb` as const)} className={`rounded-lg ${ringClass}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. BC11</Label>
                      <Input {...register(`tangki.${index}.no_bc11` as const)} className={`rounded-lg ${ringClass}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Tgl BC11</Label>
                        <Input type="date" {...register(`tangki.${index}.tgl_bc11` as const)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Pos BC11</Label>
                        <Input {...register(`tangki.${index}.no_pos_bc11` as const)} className="h-8 text-xs" />
                      </div>
                    </div>

                    {/* Consignee */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Consignee (Penerima)</Label>
                      <Input {...register(`tangki.${index}.consignee` as const)} className="rounded-lg" placeholder="NAMA PERUSAHAAN" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">ID Consignee</Label>
                      <Input {...register(`tangki.${index}.id_consignee` as const)} className="rounded-lg" placeholder="NPWP/ID" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. Polisi (Truck)</Label>
                      <Input {...register(`tangki.${index}.no_pol` as const)} className={`rounded-lg ${ringClass}`} placeholder="EX: B 1234 ABC" />
                    </div>

                    {/* Documents In/Out */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Kd. Dok Lalin *</Label>
                      <select
                        {...register(`tangki.${index}.kd_dok_inout` as const)}
                        className={`flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition-all ${ringClass}`}
                      >
                        <option value="">Pilih Kode</option>
                        {filteredKdDokInout.map((item) => (
                          <option key={item.kd_dok_inout} value={item.kd_dok_inout}>
                            {item.kd_dok_inout} - {item.nm_dok_inout}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">No. Dok Lalin</Label>
                      <Input {...register(`tangki.${index}.no_dok_inout` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Tgl. Dok Lalin</Label>
                      <Input type="date" {...register(`tangki.${index}.tgl_dok_inout` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Sarana Angkut</Label>
                      <select {...register(`tangki.${index}.kd_sar_angkut_inout` as const)} className={`flex h-10 w-full rounded-lg border border-slate-200 bg-purple-500 px-3 py-1 text-sm focus:ring-2 transition-all ${ringClass}`}>
                        <option value="LAND">DARAT (TRUK)</option>
                        <option value="SEA">LAUT (KAPAL)</option>
                        <option value="PIPE">PIPA</option>
                        <option value="AIR">UDARA (PESAWAT)</option>
                        <option value="RAIL">KERETA API</option>
                        <option value="MULTIMODA">MULTIMODA</option>
                        <option value="OTHER">LAINNYA</option>
                      </select>
                    </div>

                    {/* Ports */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Pel. Muat</Label>
                      <Input {...register(`tangki.${index}.pel_muat` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Pel. Transit</Label>
                      <Input {...register(`tangki.${index}.pel_transit` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Pel. Bongkar</Label>
                      <Input {...register(`tangki.${index}.pel_bongkar` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Wkt. In/Out</Label>
                      <Input type="datetime-local" {...register(`tangki.${index}.wk_inout` as const)} className="rounded-lg" />
                    </div>

                    {/* Dimensions & Weight */}
                    <div className="grid grid-cols-3 gap-2 lg:col-span-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Pjg (m)</Label>
                        <Input type="number" step="0.01" {...register(`tangki.${index}.panjang` as const)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Lbr (m)</Label>
                        <Input type="number" step="0.01" {...register(`tangki.${index}.lebar` as const)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Tgi (m)</Label>
                        <Input type="number" step="0.01" {...register(`tangki.${index}.tinggi` as const)} className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Berat Kosong (kg)</Label>
                        <Input type="number" step="0.01" {...register(`tangki.${index}.berat_kosong` as const)} className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Berat Isi (kg)</Label>
                        <Input type="number" step="0.01" {...register(`tangki.${index}.berat_isi` as const)} className="h-8 text-xs" />
                      </div>
                    </div>

                    {/* Production & Expiration */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Tgl. Produksi</Label>
                      <Input type="date" {...register(`tangki.${index}.tgl_produksi` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Tgl. Expired</Label>
                      <Input type="date" {...register(`tangki.${index}.tgl_expired` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Segel Beacukai</Label>
                      <Input {...register(`tangki.${index}.no_segel_bc` as const)} className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Segel Prshn</Label>
                      <Input {...register(`tangki.${index}.no_segel_perusahaan` as const)} className="rounded-lg" />
                    </div>

                    {/* TPS Permit Data */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-500 text-blue-500">No. Dok Ijin TPS (Impor : Nomor SP2; Ekspor : Kartu Ekspor)</Label>
                      <Input {...register(`tangki.${index}.no_dok_ijin_tps` as const)} className="rounded-lg border-blue-200 focus:border-blue-400" placeholder="KEP-..." />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-500 text-blue-500">Tgl. Dok Ijin TPS (yyyymmdd) (Impor : Tgl. SP2; Ekspor : Tgl. Kartu Ekspor)</Label>
                      <Input type="date" {...register(`tangki.${index}.tgl_dok_ijin_tps` as const)} className="rounded-lg border-blue-200 focus:border-blue-400" />
                    </div>

                    {/* Location & Links */}
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Lokasi Penempatan</Label>
                      <Input {...register(`tangki.${index}.lokasi_penempatan` as const)} className="rounded-lg" placeholder="KODE AREA / BLOK" />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Keterangan Tambahan</Label>
                      <Input {...register(`tangki.${index}.keterangan` as const)} className="rounded-lg" />
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
                    <div className="flex gap-2">
                      <Input type="time" step="1" {...register('jam_entry')} className={`rounded-lg flex-1 ${ringClass}`} />
                      <Button type="button" size="icon" variant="outline" onClick={() => setCurrentTime('jam_entry')} className="shrink-0"><Clock className="w-4 h-4" /></Button>
                    </div>
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
                        <div className="flex gap-2">
                          <Input type="time" step="1" {...register('jam_gate_in')} className={`rounded-lg flex-1 ${ringClass}`} />
                          <Button type="button" size="icon" variant="outline" onClick={() => setCurrentTime('jam_gate_in')} className="h-10 w-10 shrink-0"><Clock className="w-4 h-4" /></Button>
                        </div>
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
                        <div className="flex gap-2">
                          <Input type="time" step="1" {...register('jam_gate_out')} className={`rounded-lg flex-1 ${ringClass}`} />
                          <Button type="button" size="icon" variant="outline" onClick={() => setCurrentTime('jam_gate_out')} className="h-10 w-10 shrink-0"><Clock className="w-4 h-4" /></Button>
                        </div>
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