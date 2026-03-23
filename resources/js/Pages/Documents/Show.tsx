import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { PageProps } from '@/types'
import {
  Edit,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye,
  FileJson,
  Upload,
  Info,
  Package
} from "lucide-react"

interface Document {
  id: number
  ref_number: string
  kd_dok: string
  kd_tps: string
  nm_angkut: { nm_angkut: string; call_sign?: string }
  kd_gudang: string
  no_voy_flight?: string
  tgl_entry: string
  tgl_tiba?: string
  jam_entry: string
  tgl_gate_in?: string
  jam_gate_in?: string
  tgl_gate_out?: string
  jam_gate_out?: string
  keterangan?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
  tangki: Array<{
    id: number
    no_tangki: string
    seri_out?: number
    no_bl_awb?: string
    tgl_bl_awb?: string
    id_consignee?: string
    consignee?: string
    no_bc11?: string
    tgl_bc11?: string
    no_pos_bc11?: string
    kd_dok_inout?: string
    no_dok_inout?: string
    tgl_dok_inout?: string
    no_pol?: string
    jenis_isi: string
    jenis_kemasan?: string
    jml_satuan?: number
    jns_satuan?: string
    kd_sar_angkut_inout?: string
    kapasitas: number
    jumlah_isi: number
    satuan: string
    panjang?: number
    lebar?: number
    tinggi?: number
    berat_kosong?: number
    berat_isi?: number
    kondisi: string
    keterangan?: string
    tgl_produksi?: string
    tgl_expired?: string
    no_segel_bc?: string
    no_segel_perusahaan?: string
    lokasi_penempatan?: string
    wk_inout?: string
    pel_muat?: string
    pel_transit?: string
    pel_bongkar?: string
    no_dok_ijin_tps?: string
    tgl_dok_ijin_tps?: string
  }>
}

interface ShowDocumentProps extends PageProps {
  document: Document
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive'; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Clock },
  submitted: { label: 'Disubmit', variant: 'default', icon: Send },
  approved: { label: 'Disetujui', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive', icon: XCircle },
  completed: { label: 'Selesai', variant: 'success', icon: CheckCircle }
};

export default function ShowDocument({ auth, document }: ShowDocumentProps) {
  const [activeTab, setActiveTab] = useState<'header' | 'tangki' | 'waktu'>('header')
  const StatusIcon = statusConfig[document.status.toLowerCase()]?.icon || Clock
  const [transmissionFormat, setTransmissionFormat] = useState<'xml' | 'json'>('xml')
  const [isSending, setIsSending] = useState(false)

  // Context-aware theme detection
  const isOutFlow = ['3', '4', '5', '7', 'OUT', 'SPPB'].includes(document.kd_dok) || document.tangki?.[0]?.kd_dok_inout === 'OUT'
  const flowTheme = isOutFlow ? 'amber' : 'blue'
  const flowAccent = isOutFlow ? 'text-amber-600' : 'text-blue-600'
  const flowBg = isOutFlow ? 'bg-amber-100' : 'bg-blue-100'
  const flowBorder = isOutFlow ? 'border-amber-200' : 'border-blue-200'
  const flowShadow = isOutFlow ? 'shadow-amber-500/20' : 'shadow-blue-500/20'

  const handleSubmit = () => {
    if (confirm('Apakah Anda yakin ingin submit dokumen ini?')) {
      router.post(`/documents/${document.id}/submit`)
    }
  }

  const handleSendToHost = () => {
    if (confirm(`Kirim dokumen ke host dalam format ${transmissionFormat.toUpperCase()}?`)) {
      setIsSending(true)
      router.post(`/api/export/documents/${document.id}/send-to-host`, {
        format: transmissionFormat
      }, {
        onSuccess: () => {
          setIsSending(false)
          router.reload({ only: ['document'] })
        },
        onError: (errors) => {
          setIsSending(false)
          console.error('Send to host error:', errors)
        }
      })
    }
  }

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('id-ID') : '-'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  const calculatePercentage = (jumlah: number, kapasitas: number) => {
    if (kapasitas === 0) return "0"
    return ((jumlah / kapasitas) * 100).toFixed(1)
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Documents', href: '/documents' },
      { title: document.ref_number, href: `/documents/${document.id}` }
    ]}>
      <Head title={`Document ${document.ref_number}`} />

      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.get('/documents')}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-slate-50">
                  {document.ref_number}
                </h1>
                <Badge
                  variant={statusConfig[document.status.toLowerCase()]?.variant || 'secondary'}
                  className="px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-white/20"
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusConfig[document.status.toLowerCase()]?.label || document.status}
                </Badge>
              </div>
              <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                Dibuat pada {formatDateTime(document.created_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {document.status === 'draft' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.get(`/documents/${document.id}/edit`)}
                  className="rounded-xl border-slate-200 shadow-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Data
                </Button>

                <Button
                  onClick={handleSubmit}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Sekarang
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/api/export/documents/${document.id}/preview/xml`, '_blank')}
                className="rounded-xl border-slate-200 shadow-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview XML
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/api/export/documents/${document.id}/download/xml`, '_blank')}
                className="rounded-xl border-slate-200 shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {(auth.user.roles?.some((role) => role.name === 'admin') ||
              auth.user.roles?.some((role) =>
                role.permissions?.some((perm) => perm.name === 'export.json')
              )
            ) && (
                <div className="flex gap-2 border-l pl-3 ml-1 border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
                    className="rounded-xl border-slate-200 shadow-sm"
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    JSON
                  </Button>

                  {document.status === 'approved' && (
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                      <Select value={transmissionFormat} onValueChange={(value: 'xml' | 'json') => setTransmissionFormat(value)}>
                        <SelectTrigger className="w-[110px] rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xml">XML Format</SelectItem>
                          <SelectItem value="json">JSON Format</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={handleSendToHost}
                        disabled={isSending}
                        className={`${isOutFlow ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl shadow-lg ${flowShadow} px-6`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isSending ? 'Mengirim...' : 'Send to Host'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Premium Tab Navigation */}
        <div className="flex p-1 space-x-1 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 sticky top-4 z-10 backdrop-blur-md shadow-lg shadow-slate-200/20 dark:shadow-none transition-all duration-300">
          <button
            onClick={() => setActiveTab('header')}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'header'
              ? `bg-white dark:bg-slate-800 ${flowAccent} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700`
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
          >
            <Info className="w-4 h-4 mr-2" />
            Informasi Header
          </button>
          <button
            onClick={() => setActiveTab('tangki')}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'tangki'
              ? `bg-white dark:bg-slate-800 ${flowAccent} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700`
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Daftar Tangki ({document.tangki.length})
          </button>
          <button
            onClick={() => setActiveTab('waktu')}
            className={`flex-1 flex items-center justify-center py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'waktu'
              ? `bg-white dark:bg-slate-800 ${flowAccent} shadow-sm ring-1 ring-slate-200 dark:ring-slate-700`
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Waktu & Aktivitas
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'header' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 border-b p-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" /> Detail Informasi Header
                  </CardTitle>
                </div>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Kode Dokumen
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline" className={`text-sm font-bold ${flowBorder} ${flowAccent} ${isOutFlow ? 'bg-amber-50/50' : 'bg-blue-50/50'} px-3`}>{document.kd_dok}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Kode TPS
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm font-bold border-emerald-200 text-emerald-700 bg-emerald-50/50 px-3">{document.kd_tps}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Nama Angkutan
                      </label>
                      <div className="mt-1 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {document.nm_angkut?.nm_angkut}
                        {document.nm_angkut?.call_sign && (
                          <span className="text-slate-400 font-medium">
                            ({document.nm_angkut.call_sign})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Kode Gudang
                      </label>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-sm font-bold px-3">{document.kd_gudang}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        No. VOY/Flight
                      </label>
                      <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                        {document.no_voy_flight || '-'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Estimasi Kedatangan (Tiba)
                      </label>
                      <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                        {formatDate(document.tgl_tiba)}
                      </div>
                    </div>

                    {document.keterangan && (
                      <div className="col-span-full pt-4 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                          Keterangan Tambahan
                        </label>
                        <div className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          {document.keterangan}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tangki' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {document.tangki.map((tangki, index) => (
                <Card key={tangki.id} className="overflow-hidden border-slate-200 shadow-sm group hover:border-blue-300 transition-all duration-300">
                  <div className="bg-slate-50 dark:bg-slate-900 border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`${flowBg} dark:bg-blue-900/40 ${flowAccent} flex items-center justify-center font-extrabold text-sm ring-4 ring-white dark:ring-slate-800 shadow-sm`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-50 tracking-tight">DETAIL UNIT TANGKI</h4>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{tangki.no_tangki}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`bg-white dark:bg-slate-800 ${flowAccent} ${flowBorder} font-bold px-4 py-1 rounded-lg`}>
                      {tangki.kondisi}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Section Content */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Identitas Tangki</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                          {tangki.no_tangki}
                          {tangki.seri_out && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500 rounded-md">SERI: {tangki.seri_out}</Badge>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">PLAT:</span> {tangki.no_pol || '-'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Kapasitas & Satuan</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50">
                          {tangki.jumlah_isi.toLocaleString('id-ID')} / {tangki.kapasitas.toLocaleString('id-ID')}
                          <span className={`text-xs ${flowAccent} ml-1.5`}>{tangki.satuan}</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {tangki.jml_satuan?.toLocaleString('id-ID') || 0} {tangki.jns_satuan || '-'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Jenis & Kondisi</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50 text-xs">{tangki.jenis_isi}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{tangki.jenis_kemasan || 'TIPE: N/A'}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Dokumen BL/AWB</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50 text-xs">{tangki.no_bl_awb || '-'}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{formatDate(tangki.tgl_bl_awb)}</div>
                      </div>

                      {/* Second Row */}
                      <div className="space-y-3 lg:col-span-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Dokumen Pabean (BC1.1)</label>
                          <div className="font-bold text-slate-900 dark:text-slate-50 text-xs">
                            {tangki.no_bc11 || '-'}
                            <span className="text-slate-400 ml-2 font-normal">Pos: {tangki.no_pos_bc11 || '-'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium italic">{formatDate(tangki.tgl_bc11)}</div>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Dokumen In/Out ({tangki.kd_dok_inout || '-'})</label>
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {tangki.no_dok_inout || '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium italic">{formatDate(tangki.tgl_dok_inout)}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Logistik & Angkutan</label>
                        <div className="text-[10px] font-bold text-slate-800 flex flex-col gap-1">
                          <span>MUAT: {tangki.pel_muat || '-'}</span>
                          <span>TRANSIT: {tangki.pel_transit || '-'}</span>
                          <span>BONGKAR: {tangki.pel_bongkar || '-'}</span>
                        </div>
                        <div className="pt-2">
                          <Badge variant="outline" className="text-[9px] font-bold py-0 h-4">{tangki.kd_sar_angkut_inout || 'UNKNOWN'}</Badge>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Segel Perusahaan/BC</label>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase italic">PSG: {tangki.no_segel_perusahaan || '-'}</div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase italic">SBC: {tangki.no_segel_bc || '-'}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest text-blue-500">Ijin TPS</label>
                        <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200">NO: {tangki.no_dok_ijin_tps || '-'}</div>
                        <div className="text-[10px] text-slate-500 italic uppercase">TGL: {formatDate(tangki.tgl_dok_ijin_tps)}</div>
                      </div>

                      <div className="col-span-full pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Consignee (Penerima)</label>
                            <div className="text-xs font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                              {tangki.consignee || 'N/A'}
                              {tangki.id_consignee && <span className="text-[10px] font-normal text-slate-400 ml-2">[{tangki.id_consignee}]</span>}
                            </div>
                          </div>
                          <div className="space-y-1 flex-1">
                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Produksi & Kedaluwarsa</label>
                            <div className="text-[10px] font-bold text-slate-600">
                              PROD: {formatDate(tangki.tgl_produksi)} | EXP: {formatDate(tangki.tgl_expired)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'waktu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${isOutFlow ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                <div className={`${isOutFlow ? 'bg-amber-50/50' : 'bg-blue-50/50'} dark:bg-blue-900/10 border-b p-4`}>
                  <CardTitle className={`text-lg font-bold flex items-center gap-2 ${isOutFlow ? 'text-amber-700' : 'text-blue-700'} dark:text-blue-400`}>
                    <Clock className="w-5 h-5" /> Entry & Kedatangan
                  </CardTitle>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-8 flex-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Tanggal Entry</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50">{formatDate(document.tgl_entry)}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">Jam Entry</label>
                        <div className="font-bold text-slate-900 dark:text-slate-50">{document.jam_entry}</div>
                      </div>
                    </div>
                  </div>


                </CardContent>
              </Card>

              <Card className={`border-slate-200 shadow-sm overflow-hidden border-l-4 ${isOutFlow ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
                <div className={`${isOutFlow ? 'bg-amber-50/50' : 'bg-emerald-50/50'} dark:bg-emerald-900/10 border-b p-4`}>
                  <CardTitle className={`text-lg font-bold flex items-center gap-2 ${isOutFlow ? 'text-amber-700' : 'text-emerald-700'} dark:text-emerald-400`}>
                    <Send className="w-5 h-5" /> Aktivitas Gate In/Out
                  </CardTitle>
                </div>
                <CardContent className="p-8 space-y-10">
                  <div className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-10">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow-sm z-10" />
                      <div className="space-y-2">
                        <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">GATE IN (MASUK)</div>
                        <div className="flex items-center gap-6">
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-400 font-bold uppercase">Tanggal</div>
                            <div className="font-bold text-slate-900 dark:text-slate-50">{formatDate(document.tgl_gate_in)}</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-400 font-bold uppercase">Pukul</div>
                            <div className="font-bold text-slate-900 dark:text-slate-50">{document.jam_gate_in || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700 border-4 border-white dark:border-slate-900 shadow-sm z-10" />
                      <div className="space-y-2">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">GATE OUT (KELUAR)</div>
                        <div className="flex items-center gap-6">
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-400 font-bold uppercase">Tanggal</div>
                            <div className="font-bold text-slate-900 dark:text-slate-50">{formatDate(document.tgl_gate_out)}</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs text-slate-400 font-bold uppercase">Pukul</div>
                            <div className="font-bold text-slate-900 dark:text-slate-50">{document.jam_gate_out || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}


