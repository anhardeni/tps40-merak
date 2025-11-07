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
import { Plus, Trash2, Save, Download, Send } from "lucide-react"
import { router } from '@inertiajs/react'

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
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string }>
    kdDokInout: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis?: string }>
  }
  onSubmit: (data: DocumentFormData) => void
  isLoading?: boolean
}

export function DocumentForm({ document, referenceData, onSubmit, isLoading = false }: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Header</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kd_dok">Kode Dokumen *</Label>
              <select
                {...register('kd_dok')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="">Pilih Kode Dokumen</option>
                {referenceData.kdDok.map((item) => (
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
                {referenceData.kdGudang.map((item) => (
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

            <div className="space-y-2">
              <Label htmlFor="jam_entry">Jam Entry *</Label>
              <Input
                type="time"
                {...register('jam_entry')}
              />
              {errors.jam_entry && (
                <p className="text-sm text-red-500">{errors.jam_entry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgl_tiba">Tanggal Tiba</Label>
              <Input
                type="date"
                {...register('tgl_tiba')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgl_gate_in">Tanggal Gate In</Label>
              <Input
                type="date"
                {...register('tgl_gate_in')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_gate_in">Jam Gate In</Label>
              <Input
                type="time"
                {...register('jam_gate_in')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgl_gate_out">Tanggal Gate Out</Label>
              <Input
                type="date"
                {...register('tgl_gate_out')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jam_gate_out">Jam Gate Out</Label>
              <Input
                type="time"
                {...register('jam_gate_out')}
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                {...register('keterangan')}
                placeholder="Masukkan keterangan tambahan"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tangki Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Tangki</CardTitle>
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih Kode Dok IN/OUT</option>
                      {referenceData.kdDokInout?.map((item) => (
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
                    <Label>Kode Dokumen Inout</Label>
                    <Input
                      {...register(`tangki.${index}.kd_dok_inout` as const)}
                      placeholder="Kode dokumen in/out"
                      maxLength={10}
                    />
                  </div>

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
                    <Input
                      {...register(`tangki.${index}.jenis_kemasan` as const)}
                      placeholder="Masukkan jenis kemasan"
                    />
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
                    <Input
                      {...register(`tangki.${index}.jns_satuan` as const)}
                      placeholder="Jenis satuan"
                      maxLength={10}
                    />
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
                <details className="space-y-4">
                  <summary className="cursor-pointer font-medium">Dimensi & Berat (Opsional)</summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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
                </details>
              </div>
            ))}
          </CardContent>
        </Card>

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