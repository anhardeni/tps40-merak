import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Textarea } from "@/Components/ui/textarea"
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Clock, Info, Package, Calendar } from "lucide-react"
import { usePage } from '@inertiajs/react'

const kontainerSchema = z.object({
  header: z.object({
    kd_dok: z.string().min(1, 'Kode dokumen wajib diisi'),
    kd_tps: z.string().min(1, 'Kode TPS wajib diisi'),
    kd_gudang: z.string().min(1, 'Kode gudang wajib diisi'),
    tgl_tiba: z.string().min(1, 'Tanggal tiba wajib diisi'),
    no_bc11: z.string().min(1, 'Nomor BC 1.1 wajib diisi').max(6),
    tgl_bc11: z.string().min(1, 'Tanggal BC 1.1 wajib diisi'),
    keterangan: z.string().optional(),
  }),
  kontainer: z.array(z.object({
    no_kontainer: z.string().min(1, 'Nomor kontainer wajib diisi').max(20),
    ukuran_kontainer: z.string().min(1, 'Ukuran wajib diisi'),
    no_segel: z.string().min(1, 'Nomor segel wajib diisi').max(20),
    jns_kontainer: z.string().min(1, 'Jenis kontainer wajib diisi'),
    bruto: z.coerce.number().min(0.001, 'Bruto harus lebih besar dari 0'),
    wk_inout: z.string().min(1, 'Waktu In/Out wajib diisi'),
    // Optional fields
    kd_kantor: z.string().optional(),
    no_bl_awb: z.string().optional(),
    tgl_bl_awb: z.string().optional(),
    no_master_bl_awb: z.string().optional(),
    tgl_master_bl_awb: z.string().optional(),
    id_consignee: z.string().optional(),
    consignee: z.string().optional(),
    no_pos_bc11: z.string().optional(),
    kd_timbun: z.string().optional(),
    kd_sar_angkut: z.string().optional(),
    no_pol: z.string().optional(),
    fl_kontainer: z.boolean().default(true),
    iso_code: z.string().optional(),
    pel_muat: z.string().optional(),
    pel_transit: z.string().optional(),
    pel_bongkar: z.string().optional(),
    gudang_tujuan: z.string().optional(),
    no_daftar_pabean: z.string().optional(),
    tgl_daftar_pabean: z.string().optional(),
    no_segel_bc: z.string().optional(),
    tgl_segel_bc: z.string().optional(),
    no_ijin_tps: z.string().optional(),
    tgl_ijin_tps: z.string().optional(),
    kd_dok_inout: z.string().optional(),
  })).min(1, 'Minimal harus ada 1 kontainer'),
})

type KontainerFormData = z.infer<typeof kontainerSchema>

interface Props {
  document?: any
  referenceData: {
    kdDok: any[]
    kdTps: any[]
    kdGudang: any[]
  }
  onSubmit: (data: KontainerFormData) => void
  isLoading?: boolean
}

export function KontainerForm({ document, referenceData, onSubmit, isLoading = false }: Props) {
  const [activeTab, setActiveTab] = useState<'header' | 'kontainer'>('header')
  const { props } = usePage()
  const serverErrors = props.errors as any

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<KontainerFormData>({
    resolver: zodResolver(kontainerSchema) as any,
    defaultValues: {
      header: {
        kd_dok: document?.kd_dok || '1',
        kd_tps: document?.kd_tps || '',
        kd_gudang: document?.kd_gudang || '',
        tgl_tiba: formatDateForInput(document?.tgl_tiba) || '',
        no_bc11: document?.no_bc11 || '',
        tgl_bc11: formatDateForInput(document?.tgl_bc11) || '',
        keterangan: document?.keterangan || '',
      },
      kontainer: document?.kontainers?.map((k: any) => ({
        ...k,
        tgl_bl_awb: formatDateForInput(k.tgl_bl_awb),
        tgl_master_bl_awb: formatDateForInput(k.tgl_master_bl_awb),
        tgl_daftar_pabean: formatDateForInput(k.tgl_daftar_pabean),
        tgl_segel_bc: formatDateForInput(k.tgl_segel_bc),
        tgl_ijin_tps: formatDateForInput(k.tgl_ijin_tps),
        wk_inout: k.wk_inout ? new Date(k.wk_inout).toISOString().slice(0, 16) : '',
      })) || [{
        no_kontainer: '',
        ukuran_kontainer: '20',
        no_segel: '',
        jns_kontainer: '8',
        bruto: 0,
        wk_inout: new Date().toISOString().slice(0, 16),
        fl_kontainer: true,
      }]
    }
  })

  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsImporting(true)
      const response = await axios.post('/kontainer/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data?.success && Array.isArray(response.data?.data)) {
        const parseExcelDate = (val: any) => {
          if (!val) return '';
          const d = new Date(val);
          return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        };

        const parseExcelDateTime = (val: any) => {
          if (!val) return new Date().toISOString().slice(0, 16);
          const d = new Date(val);
          return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 16) : d.toISOString().slice(0, 16);
        };

        const importedRows = response.data.data.map((row: any) => ({
          no_kontainer: row.no_kontainer || row.nomor_kontainer || row.nomorkontainer || row.nomorKontainer || '',
          ukuran_kontainer: String(row.ukuran_kontainer || row.ukuran_container || row.ukuranKontainer || '20'),
          no_segel: row.no_segel || row.nomor_segel || row.nomorSegel || '',
          jns_kontainer: String(row.jns_kontainer || row.jenis_kontainer || row.jenisKontainer || '8'),
          bruto: parseFloat(row.bruto) || 0,
          wk_inout: parseExcelDateTime(row.wk_inout || row.waktu_inout || row.waktuInOut),
          
          // Optional fields mapped robustly from either snake_case, camelCase or direct properties
          kd_kantor: row.kd_kantor || row.kode_kantor || row.kodeKantor || '',
          no_bl_awb: row.no_bl_awb || row.nomor_bl_awb || row.noBlAwb || '',
          tgl_bl_awb: parseExcelDate(row.tgl_bl_awb || row.tanggal_bl_awb || row.tanggalBlAwb),
          no_master_bl_awb: row.no_master_bl_awb || row.noMasterBlAwb || '',
          tgl_master_bl_awb: parseExcelDate(row.tgl_master_bl_awb || row.tanggalMasterBlAwb),
          id_consignee: row.id_consignee || row.idConsignee || '',
          consignee: row.consignee || '',
          no_pos_bc11: row.no_pos_bc11 || row.nomorPosBc11 || '',
          kd_timbun: row.kd_timbun || row.kodeTimbun || '',
          kd_sar_angkut: row.kd_sar_angkut || row.kodeSaranaPengangkut || '',
          no_pol: row.no_pol || row.nomorPolisi || '',
          fl_kontainer: row.fl_kontainer !== undefined ? Boolean(row.fl_kontainer) : (row.flagKontainer !== undefined ? Boolean(row.flagKontainer) : true),
          iso_code: row.iso_code || row.isoCode || '',
          pel_muat: row.pel_muat || row.pelabuhanMuat || '',
          pel_transit: row.pel_transit || row.pelabuhanTransit || '',
          pel_bongkar: row.pel_bongkar || row.pelabuhanBongkar || '',
          gudang_tujuan: row.gudang_tujuan || row.gudangTujuan || '',
          no_daftar_pabean: row.no_daftar_pabean || row.nomorDaftarPabean || '',
          tgl_daftar_pabean: parseExcelDate(row.tgl_daftar_pabean || row.tanggalDaftarPabean),
          no_segel_bc: row.no_segel_bc || row.nomorSegelBc || '',
          tgl_segel_bc: parseExcelDate(row.tgl_segel_bc || row.tanggalSegelBc),
          no_ijin_tps: row.no_ijin_tps || row.nomorIjinTps || '',
          tgl_ijin_tps: parseExcelDate(row.tgl_ijin_tps || row.tanggalIjinTps),
          kd_dok_inout: row.kd_dok_inout || row.kodeDokumenInOut || '',
        }))

        if (fields.length === 1 && !fields[0].no_kontainer) {
          remove(0)
        }

        importedRows.forEach((row: any) => append(row))
        alert(`Berhasil mengimpor ${importedRows.length} kontainer!`)
      } else {
        alert('Format file Excel tidak sesuai atau data kosong')
      }
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.error || 'Gagal mengimpor file Excel')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: "kontainer"
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tab Nav */}
      <div className="flex p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'header' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Info className="w-4 h-4 mr-2 inline" />
          Header Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kontainer')}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'kontainer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Package className="w-4 h-4 mr-2 inline" />
          Containers ({fields.length})
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {activeTab === 'header' && (
          <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" />
                Informasi Kedatangan (Header)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Kode TPS *</Label>
                <select {...register('header.kd_tps')} className="w-full h-10 rounded-xl bg-slate-50 border-none px-4 text-sm font-bold">
                  <option value="">Pilih TPS</option>
                  {referenceData.kdTps.map(t => <option key={t.kd_tps} value={t.kd_tps}>{t.kd_tps} - {t.nm_tps}</option>)}
                </select>
                {errors.header?.kd_tps && <p className="text-xs text-rose-500 font-bold">{errors.header.kd_tps.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Kode Gudang *</Label>
                <select {...register('header.kd_gudang')} className="w-full h-10 rounded-xl bg-slate-50 border-none px-4 text-sm font-bold">
                  <option value="">Pilih Gudang</option>
                  {referenceData.kdGudang.map(g => <option key={g.kd_gudang} value={g.kd_gudang}>{g.kd_gudang} - {g.nm_gudang}</option>)}
                </select>
                {errors.header?.kd_gudang && <p className="text-xs text-rose-500 font-bold">{errors.header.kd_gudang.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tanggal Tiba *</Label>
                <Input type="date" {...register('header.tgl_tiba')} className="h-10 rounded-xl bg-slate-50 border-none font-bold" />
                {errors.header?.tgl_tiba && <p className="text-xs text-rose-500 font-bold">{errors.header.tgl_tiba.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Nomor BC 1.1 *</Label>
                <Input {...register('header.no_bc11')} placeholder="Maks 6 digit" className="h-10 rounded-xl bg-slate-50 border-none font-bold" />
                {errors.header?.no_bc11 && <p className="text-xs text-rose-500 font-bold">{errors.header.no_bc11.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tanggal BC 1.1 *</Label>
                <Input type="date" {...register('header.tgl_bc11')} className="h-10 rounded-xl bg-slate-50 border-none font-bold" />
                {errors.header?.tgl_bc11 && <p className="text-xs text-rose-500 font-bold">{errors.header.tgl_bc11.message}</p>}
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label>Keterangan</Label>
                <Textarea {...register('header.keterangan')} className="rounded-xl bg-slate-50 border-none font-medium" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'kontainer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tighter">Daftar Kontainer</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleExcelImport}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold"
                >
                  {isImporting ? 'Mengimpor...' : 'Import Excel'}
                </Button>
                <Button type="button" onClick={() => append({ no_kontainer: '', ukuran_kontainer: '20', no_segel: '', jns_kontainer: '8', bruto: 0, wk_inout: new Date().toISOString().slice(0, 16), fl_kontainer: true })} className="bg-indigo-600 rounded-xl font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Tambah Kontainer
                </Button>
              </div>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="border-none shadow-lg rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest">Kontainer #{index + 1}</span>
                  <Button type="button" variant="ghost" onClick={() => remove(index)} className="h-8 text-rose-400 hover:text-rose-500 hover:bg-white/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">No. Kontainer *</Label>
                    <Input {...register(`kontainer.${index}.no_kontainer`)} className="h-9 rounded-lg bg-slate-50 border-none font-bold" />
                    {errors.kontainer?.[index]?.no_kontainer && <p className="text-[10px] text-rose-500 font-bold">{errors.kontainer[index].no_kontainer.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Ukuran *</Label>
                    <select {...register(`kontainer.${index}.ukuran_kontainer`)} className="w-full h-9 rounded-lg bg-slate-50 border-none px-2 text-xs font-bold">
                      <option value="20">20 FT</option>
                      <option value="40">40 FT</option>
                      <option value="45">45 FT</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">No. Segel *</Label>
                    <Input {...register(`kontainer.${index}.no_segel`)} className="h-9 rounded-lg bg-slate-50 border-none font-bold" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Jenis *</Label>
                    <select {...register(`kontainer.${index}.jns_kontainer`)} className="w-full h-9 rounded-lg bg-slate-50 border-none px-2 text-xs font-bold">
                      <option value="4">EMPTY (4)</option>
                      <option value="7">LCL (7)</option>
                      <option value="8">FCL (8)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Bruto (KG) *</Label>
                    <Input type="number" step="0.001" {...register(`kontainer.${index}.bruto`)} className="h-9 rounded-lg bg-slate-50 border-none font-bold" />
                  </div>

                  <div className="space-y-1 lg:col-span-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Waktu Gate In/Out *</Label>
                    <Input type="datetime-local" {...register(`kontainer.${index}.wk_inout`)} className="h-9 rounded-lg bg-slate-50 border-none font-bold" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => window.history.back()} className="rounded-xl font-bold">Batal</Button>
          <Button type="submit" disabled={isLoading} className="bg-indigo-600 rounded-xl px-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
            {isLoading ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
        </div>
      </form>
    </div>
  )
}
