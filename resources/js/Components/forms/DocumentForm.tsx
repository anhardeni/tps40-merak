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
import { Plus, Trash2, Save, Download, FileSpreadsheet, ArrowDownCircle, ArrowUpCircle, LayoutGrid, FileText, Package, Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react"
import { router } from '@inertiajs/react'

// Constants for Document Mapping
const DOK_IN_CODES = ['1', '3', '5', '6']
const DOK_OUT_CODES = ['2', '4', '7', '8', '9']

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
    kd_dok_inout: z.string().min(1, 'Kode dokumen IN/OUT wajib dipilih'),
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
    // include kd_tps property so frontend can filter gudang by selected TPS
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string; kd_tps?: string }>
    kdDokInout: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis?: string }>
    jenisSatuan: Array<{ kode_satuan_barang: string; nama_satuan_barang: string }>
    jenisKemasan: Array<{ kode_jenis_kemasan: string; nama_jenis_kemasan: string }>
  }
  onSubmit: (data: DocumentFormData) => void
  isLoading?: boolean
}

export function DocumentForm({ document, referenceData, onSubmit, isLoading = false }: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Logic to determine initial mode
  const getInitialMode = () => {
    if (!document?.kd_dok) return 'IN' // Default to IN for new documents
    if (DOK_IN_CODES.includes(document.kd_dok)) return 'IN'
    if (DOK_OUT_CODES.includes(document.kd_dok)) return 'OUT'
    return 'ALL'
  }

  const [entryMode, setEntryMode] = useState<'ALL' | 'IN' | 'OUT'>(getInitialMode())
  const [activeTab, setActiveTab] = useState<'header' | 'tangki' | 'gate'>('header')

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
    },
  })

  // Error indicators for tabs (Must be defined after useForm)
  const hasHeaderError = !!(errors.kd_dok || errors.kd_tps || errors.nm_angkut_id || errors.kd_gudang || errors.tgl_entry || errors.jam_entry)
  const hasTangkiError = !!errors.tangki
  const hasGateError = !!(errors.tgl_gate_in || errors.jam_gate_in || errors.tgl_gate_out || errors.jam_gate_out || errors.tgl_tiba)

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tangki"
  })

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/documents/parse-tangki-excel', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': (window.document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        const newTangkis = result.data.map((item: any) => ({
          kd_dok_inout: item.kd_dok_inout || '',
          no_tangki: item.no_tangki || '',
          seri_out: item.seri_out || 0,
          no_bl_awb: item.no_bl_awb || '',
          tgl_bl_awb: item.tgl_bl_awb || '',
          id_consignee: item.id_consignee || '',
          consignee: item.consignee || '',
          no_bc11: item.no_bc11 || '',
          tgl_bc11: item.tgl_bc11 || '',
          no_pos_bc11: item.no_pos_bc11 || '',
          jml_satuan: item.jml_satuan || 0,
          jns_satuan: item.jns_satuan || '',
          no_dok_inout: item.no_dok_inout || '',
          tgl_dok_inout: item.tgl_dok_inout || '',
          kd_sar_angkut_inout: item.kd_sar_angkut_inout || '',
          no_pol: item.no_pol || '',
          jenis_isi: item.jenis_isi || '',
          jenis_kemasan: item.jenis_kemasan || '',
          kapasitas: item.kapasitas || 0,
          jumlah_isi: item.jumlah_isi || 0,
          satuan: item.satuan || 'LITER',
          panjang: item.panjang || 0,
          lebar: item.lebar || 0,
          tinggi: item.tinggi || 0,
          berat_kosong: item.berat_kosong || 0,
          berat_isi: item.berat_isi || 0,
          kondisi: item.kondisi || 'BAIK',
          keterangan: item.keterangan || '',
          tgl_produksi: item.tgl_produksi || '',
          tgl_expired: item.tgl_expired || '',
          no_segel_bc: item.no_segel_bc || '',
          no_segel_perusahaan: item.no_segel_perusahaan || '',
          lokasi_penempatan: item.lokasi_penempatan || '',
          wk_inout: item.wk_inout || '',
          pel_muat: item.pel_muat || '',
          pel_transit: item.pel_transit || '',
          pel_bongkar: item.pel_bongkar || '',
        }))

        if (fields.length === 1 && !fields[0].no_tangki) {
          remove(0)
        }

        append(newTangkis)
        alert(`Berhasil mengimport ${newTangkis.length} data tangki.`)
      } else {
        alert('Gagal memproses file: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Terjadi kesalahan saat mengupload file.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // watch selected TPS and current selected gudang to implement dependent dropdown
  const selectedKdTps = watch('kd_tps')
  const selectedKdGudang = watch('kd_gudang')

  // compute filtered gudang options based on selected TPS
  const filteredKdGudang = referenceData.kdGudang.filter((g) => {
    if (!selectedKdTps) return true // no TPS selected -> show all
    return g.kd_tps === selectedKdTps
  })

  // filtered document codes based on entry mode
  const filteredKdDok = referenceData.kdDok.filter((d) => {
    if (entryMode === 'ALL') return true
    if (entryMode === 'IN') return DOK_IN_CODES.includes(d.kd_dok)
    if (entryMode === 'OUT') return DOK_OUT_CODES.includes(d.kd_dok)
    return true
  })

  // filtered kd_dok_inout based on entry mode for tangki detail
  const filteredKdDokInout = referenceData.kdDokInout?.filter((d) => {
    if (entryMode === 'ALL') return true
    return d.jenis === entryMode
  })

  // if the currently selected document code is not in the filtered list when switching modes, clear it
  useEffect(() => {
    const currentKdDok = watch('kd_dok')
    if (currentKdDok && entryMode !== 'ALL') {
      const isValid = filteredKdDok.some(d => d.kd_dok === currentKdDok)
      if (!isValid) {
        setValue('kd_dok', '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryMode])

  useEffect(() => {
    if (!selectedKdGudang) return
    const stillValid = filteredKdGudang.some((g) => g.kd_gudang === selectedKdGudang)
    if (!stillValid) {
      setValue('kd_gudang', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKdTps])

  const handleFormSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTangki = () => {
    append({
      kd_dok_inout: '',
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
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {document ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}
        </h1>
        <div className="flex gap-2">
          {document && (
            <>
              <Button
                variant="outline"
                onClick={() => window.open(`/api/export/documents/${document.id}/preview/xml`, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Preview XML
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Preview JSON
              </Button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <button
            type="button"
            onClick={() => setEntryMode('IN')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              entryMode === 'IN' 
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'border-slate-200 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950'
            }`}
          >
            <ArrowDownCircle className={`w-8 h-8 mb-2 ${entryMode === 'IN' ? 'text-blue-500' : 'text-slate-400'}`} />
            <span className="font-bold">MASUK (GATE IN)</span>
            <span className="text-xs opacity-60">Impor / Penimbunan</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('OUT')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              entryMode === 'OUT' 
                ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' 
                : 'border-slate-200 bg-white hover:border-orange-200 dark:border-slate-800 dark:bg-slate-950'
            }`}
          >
            <ArrowUpCircle className={`w-8 h-8 mb-2 ${entryMode === 'OUT' ? 'text-orange-500' : 'text-slate-400'}`} />
            <span className="font-bold">KELUAR (GATE OUT)</span>
            <span className="text-xs opacity-60">Ekspor / Pengiriman</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('ALL')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              entryMode === 'ALL' 
                ? 'border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400' 
                : 'border-slate-200 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950'
            }`}
          >
            <LayoutGrid className={`w-8 h-8 mb-2 ${entryMode === 'ALL' ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className="font-bold">TAMPILKAN SEMUA</span>
            <span className="text-xs opacity-60">Mode Manual / Custom</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 bg-white dark:bg-slate-950 sticky top-0 z-10 py-1 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'header' 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <FileText className="w-4 h-4" />
              {hasHeaderError && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <span className="whitespace-nowrap">Header</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tangki')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'tangki' 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Package className="w-4 h-4" />
              {hasTangkiError && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <span className="whitespace-nowrap">Tangki</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 ml-1">
              {fields.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gate')}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'gate' 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="relative">
              <Clock className="w-4 h-4" />
              {hasGateError && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <span className="whitespace-nowrap">Waktu & Gate</span>
          </button>
        </div>
        {/* Tab 1: Header */}
        {activeTab === 'header' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kd_dok">Kode Dokumen *</Label>
              <select
                {...register('kd_dok')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Pilih Kode Dokumen</option>
                {filteredKdDok.map((item) => (
                  <option key={item.kd_dok} value={item.kd_dok}>
                    {item.kd_dok} - {item.nm_dok}
                  </option>
                ))}
              </select>
              {errors.kd_dok && (
                <p className="text-sm text-red-500">{errors.kd_dok.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kd_tps">Kode TPS *</Label>
              <select
                {...register('kd_tps')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Pilih Kode TPS</option>
                {referenceData.kdTps.map((item) => (
                  <option key={item.kd_tps} value={item.kd_tps}>
                    {item.kd_tps} - {item.nm_tps}
                  </option>
                ))}
              </select>
              {errors.kd_tps && (
                <p className="text-sm text-red-500">{errors.kd_tps.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nm_angkut_id">Nama Angkutan *</Label>
              <select
                {...register('nm_angkut_id')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Pilih Nama Angkutan</option>
                {referenceData.nmAngkut.map((item) => (
                  <option key={item.id} value={item.id.toString()}>
                    {item.nm_angkut} {item.call_sign ? `(${item.call_sign})` : ''}
                  </option>
                ))}
              </select>
              {errors.nm_angkut_id && (
                <p className="text-sm text-red-500">{errors.nm_angkut_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kd_gudang">Kode Gudang *</Label>
              <select
                {...register('kd_gudang')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Pilih Kode Gudang</option>
                {filteredKdGudang.map((item) => (
                  <option key={item.kd_gudang} value={item.kd_gudang}>
                    {item.kd_gudang} - {item.nm_gudang}
                  </option>
                ))}
              </select>
              {errors.kd_gudang && (
                <p className="text-sm text-red-500">{errors.kd_gudang.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="no_voy_flight">No. VOY/Flight</Label>
              <Input
                {...register('no_voy_flight')}
                placeholder="Masukkan nomor voyage/flight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgl_entry">Tanggal Entry *</Label>
              <Input
                type="date"
                {...register('tgl_entry')}
              />
              {errors.tgl_entry && (
                <p className="text-sm text-red-500">{errors.tgl_entry.message}</p>
              )}
              </div>

              <div className="col-span-full space-y-2">
                <Label htmlFor="keterangan">Keterangan Umum</Label>
                <Textarea
                  {...register('keterangan')}
                  placeholder="Catatan umum dokumen"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t flex justify-end">
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveTab('tangki')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Lanjut ke Detail Tangki
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

        {/* Tab 2: Tangki Details */}
        {activeTab === 'tangki' && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-500" />
                  Detail Tangki
                </CardTitle>
              <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-none shadow-md transition-all duration-200"
                    onClick={() => window.open('/documents/template/download', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Import Excel
                  </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTangki}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tangki
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field: any, index: number) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Tangki #{index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Tangki Info */}
                  <div className="space-y-2">
                    <Label>Kode Dok IN/OUT *</Label>
                    <select
                      {...register(`tangki.${index}.kd_dok_inout` as const)}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        entryMode === 'IN' ? 'border-blue-200' : entryMode === 'OUT' ? 'border-orange-200' : ''
                      }`}
                    >
                      <option value="">Pilih Kode Dok IN/OUT</option>
                      {filteredKdDokInout?.map((item) => (
                        <option key={item.kd_dok_inout} value={item.kd_dok_inout}>
                          {item.kd_dok_inout} - {item.nm_dok_inout} {item.jenis ? `(${item.jenis})` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.tangki?.[index]?.kd_dok_inout && (
                      <p className="text-sm text-red-500">{errors.tangki[index].kd_dok_inout.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>No. Tangki *</Label>
                    <Input
                      {...register(`tangki.${index}.no_tangki` as const)}
                      placeholder="Masukkan nomor tangki"
                    />
                    {errors.tangki?.[index]?.no_tangki && (
                      <p className="text-sm text-red-500">{errors.tangki[index].no_tangki.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Seri Out</Label>
                    <Input
                      type="number"
                      {...register(`tangki.${index}.seri_out` as const, {
                        setValueAs: (v: any) => v === '' ? undefined : parseInt(v)
                      })}
                      placeholder="Auto-generated"
                      className="bg-gray-50 dark:bg-gray-800"
                      readOnly
                    />
                    <p className="text-xs text-gray-500">Otomatis diisi oleh sistem</p>
                  </div>

                  <div className="space-y-2">
                    <Label>No. BL/AWB</Label>
                    <Input
                      {...register(`tangki.${index}.no_bl_awb` as const)}
                      placeholder="Masukkan nomor BL/AWB"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tgl. BL/AWB</Label>
                    <Input
                      type="date"
                      {...register(`tangki.${index}.tgl_bl_awb` as const)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ID Consignee</Label>
                    <Input
                      {...register(`tangki.${index}.id_consignee` as const)}
                      placeholder="Masukkan ID consignee"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Consignee</Label>
                    <Input
                      {...register(`tangki.${index}.consignee` as const)}
                      placeholder="Masukkan nama consignee"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>No. BC11</Label>
                    <Input
                      {...register(`tangki.${index}.no_bc11` as const)}
                      placeholder="Masukkan nomor BC11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tgl. BC11</Label>
                    <Input
                      type="date"
                      {...register(`tangki.${index}.tgl_bc11` as const)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>No. Pos BC11</Label>
                    <Input
                      {...register(`tangki.${index}.no_pos_bc11` as const)}
                      placeholder="Masukkan nomor posisi BC11"
                    />
                  </div>

                  {/* Dokumen Inout Section */}

                  <div className="space-y-2">
                    <Label>No. Dokumen Inout</Label>
                    <Input
                      {...register(`tangki.${index}.no_dok_inout` as const)}
                      placeholder="Nomor dokumen in/out"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tgl. Dokumen Inout</Label>
                    <Input
                      type="date"
                      {...register(`tangki.${index}.tgl_dok_inout` as const)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kode Sarana Angkut</Label>
                    <Input
                      {...register(`tangki.${index}.kd_sar_angkut_inout` as const)}
                      placeholder="Kode sarana angkut"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>No. Polisi</Label>
                    <Input
                      {...register(`tangki.${index}.no_pol` as const)}
                      placeholder="Nomor polisi kendaraan"
                      maxLength={20}
                    />
                  </div>

                  {/* Jenis & Satuan */}
                  <div className="space-y-2">
                    <Label>Jenis Isi *</Label>
                    <Input
                      {...register(`tangki.${index}.jenis_isi` as const)}
                      placeholder="Masukkan jenis isi"
                    />
                    {errors.tangki?.[index]?.jenis_isi && (
                      <p className="text-sm text-red-500">{errors.tangki[index].jenis_isi.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis Kemasan</Label>
                    <select
                      {...register(`tangki.${index}.jenis_kemasan` as const)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="">Pilih Jenis Kemasan</option>
                      {referenceData.jenisKemasan?.map((item) => (
                        <option key={item.kode_jenis_kemasan} value={item.kode_jenis_kemasan}>
                          {item.kode_jenis_kemasan} - {item.nama_jenis_kemasan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kapasitas *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`tangki.${index}.kapasitas` as const, {
                        setValueAs: (v: any) => v === '' ? 0 : parseFloat(v)
                      })}
                      placeholder="0.000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah Isi *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      {...register(`tangki.${index}.jumlah_isi` as const, {
                        setValueAs: (v: any) => v === '' ? 0 : parseFloat(v)
                      })}
                      placeholder="0.000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Satuan *</Label>
                    <select
                      {...register(`tangki.${index}.satuan` as const)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="LITER">LITER</option>
                      <option value="KGM">KGM</option>
                      <option value="M3">M3</option>
                      <option value="TON">TON</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Jumlah Satuan</Label>
                    <Input
                      type="number"
                      {...register(`tangki.${index}.jml_satuan` as const, {
                        setValueAs: (v: any) => v === '' ? 0 : parseInt(v)
                      })}
                      placeholder="Jumlah satuan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Jenis Satuan</Label>
                    <select
                      {...register(`tangki.${index}.jns_satuan` as const)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="">Pilih Jenis Satuan</option>
                      {referenceData.jenisSatuan?.map((item) => (
                        <option key={item.kode_satuan_barang} value={item.kode_satuan_barang}>
                          {item.kode_satuan_barang} - {item.nama_satuan_barang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pelabuhan Info */}
                  <div className="space-y-2">
                    <Label>Pelabuhan Muat</Label>
                    <Input
                      {...register(`tangki.${index}.pel_muat` as const)}
                      placeholder="MYBWH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pelabuhan Transit</Label>
                    <Input
                      {...register(`tangki.${index}.pel_transit` as const)}
                      placeholder="Masukkan pelabuhan transit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pelabuhan Bongkar</Label>
                    <Input
                      {...register(`tangki.${index}.pel_bongkar` as const)}
                      placeholder="IDMRK"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Kondisi</Label>
                    <select
                      {...register(`tangki.${index}.kondisi` as const)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="BAIK">BAIK</option>
                      <option value="RUSAK">RUSAK</option>
                      <option value="BOCOR">BOCOR</option>
                    </select>
                  </div>
                </div>

                {/* Dimensi dan Berat */}
                <div className="space-y-4 border-t pt-4 mt-4">
                  <h5 className="font-medium text-sm text-slate-500 dark:text-slate-400">Dimensi & Berat</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Panjang (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`tangki.${index}.panjang` as const, {
                          setValueAs: (v: any) => v === '' ? undefined : parseFloat(v)
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lebar (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`tangki.${index}.lebar` as const, {
                          setValueAs: (v: any) => v === '' ? undefined : parseFloat(v)
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tinggi (m)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`tangki.${index}.tinggi` as const, {
                          setValueAs: (v: any) => v === '' ? undefined : parseFloat(v)
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Berat Kosong (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`tangki.${index}.berat_kosong` as const, {
                          setValueAs: (v: any) => v === '' ? undefined : parseFloat(v)
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Berat Isi (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`tangki.${index}.berat_isi` as const, {
                          setValueAs: (v: any) => v === '' ? undefined : parseFloat(v)
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lokasi Penempatan</Label>
                      <Input
                        {...register(`tangki.${index}.lokasi_penempatan` as const)}
                        placeholder="Masukkan lokasi penempatan"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Waktu In/Out</Label>
                      <Input
                        type="datetime-local"
                        {...register(`tangki.${index}.wk_inout` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tgl. Produksi</Label>
                      <Input
                        type="date"
                        {...register(`tangki.${index}.tgl_produksi` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tgl. Expired</Label>
                      <Input
                        type="date"
                        {...register(`tangki.${index}.tgl_expired` as const)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>No. Segel BC</Label>
                      <Input
                        {...register(`tangki.${index}.no_segel_bc` as const)}
                        placeholder="Masukkan nomor segel BC"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>No. Segel Perusahaan</Label>
                      <Input
                        {...register(`tangki.${index}.no_segel_perusahaan` as const)}
                        placeholder="Masukkan nomor segel perusahaan"
                      />
                    </div>

                    <div className="col-span-full space-y-2">
                      <Label>Keterangan</Label>
                      <Textarea
                        {...register(`tangki.${index}.keterangan` as const)}
                        placeholder="Masukkan keterangan tambahan untuk tangki ini"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('header')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => setActiveTab('gate')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Lanjut ke Waktu Gate
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 3: Gate & Confirmation */}
      {activeTab === 'gate' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Operasional & Gerbang
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tgl_tiba">Tanggal Tiba</Label>
                <Input
                  type="date"
                  {...register('tgl_tiba')}
                />
              </div>

              <div className="hidden md:block"></div>

              {(entryMode === 'IN' || entryMode === 'ALL') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tgl_gate_in">Tanggal Gate In</Label>
                    <Input
                      type="date"
                      {...register('tgl_gate_in')}
                      className="border-blue-200 dark:border-blue-900/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jam_gate_in">Jam Gate In</Label>
                    <Input
                      type="time"
                      {...register('jam_gate_in')}
                      className="border-blue-200 dark:border-blue-900/30"
                    />
                  </div>
                </>
              )}

              {(entryMode === 'OUT' || entryMode === 'ALL') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tgl_gate_out">Tanggal Gate Out</Label>
                    <Input
                      type="date"
                      {...register('tgl_gate_out')}
                      className="border-orange-200 dark:border-orange-900/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jam_gate_out">Jam Gate Out</Label>
                    <Input
                      type="time"
                      {...register('jam_gate_out')}
                      className="border-orange-200 dark:border-orange-900/30"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Review Card */}
          <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center text-blue-700 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ringkasan Sebelum Menyimpan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-xs text-slate-500">Tipe Flow</Label>
                <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center">
                  {entryMode === 'IN' ? 'MASUK' : entryMode === 'OUT' ? 'KELUAR' : 'CAMPURAN'}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Kode Dokumen</Label>
                <div className="font-medium text-slate-900 dark:text-slate-100">{watch('kd_dok') || '-'}</div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Total Tangki</Label>
                <div className="font-medium text-slate-900 dark:text-slate-100">{fields.length} Tangki</div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Lokasi</Label>
                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{watch('kd_gudang') || '-'}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab('tangki')}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali ke Tangki
            </Button>
            {hasHeaderError || hasTangkiError ? (
              <div className="flex items-center text-red-500 text-xs gap-1 font-medium italic">
                <AlertCircle className="w-4 h-4" />
                Ada kesalahan di tab sebelumnya
              </div>
            ) : null}
          </div>
        </div>
      )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.get('/documents')}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="min-w-[120px]"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {document ? 'Update' : 'Simpan'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}