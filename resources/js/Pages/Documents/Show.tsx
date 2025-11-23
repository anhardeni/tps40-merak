import React, { useState, useRef } from 'react'
import { Head } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { Button } from "@/Components/ui/button"
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/Components/ui/dialog'
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
  FileSpreadsheet
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
  }>
}

interface ShowDocumentProps extends PageProps {
  document: Document
  kdDokInout?: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis?: string }>
  jenisSatuan?: Array<{ kode_satuan_barang: string; nama_satuan_barang: string }>
  jenisKemasan?: Array<{ kode_jenis_kemasan: string; nama_jenis_kemasan: string }>
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
  submitted: { label: 'Disubmit', variant: 'default' as const, icon: Send },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Selesai', variant: 'success' as const, icon: CheckCircle }
};

export default function ShowDocument({ auth, document, kdDokInout, jenisSatuan, jenisKemasan }: ShowDocumentProps) {
  const StatusIcon = statusConfig[document.status].icon
  const [transmissionFormat, setTransmissionFormat] = useState<'xml' | 'json'>('xml')
  const [isSending, setIsSending] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [transmissionHistory, setTransmissionHistory] = useState<any[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newTangki, setNewTangki] = useState({
    kd_dok_inout: '',
    no_tangki: '',
    jenis_isi: '',
    kapasitas: 0,
    jumlah_isi: 0,
    satuan: 'LITER',
    kondisi: 'BAIK',
    no_bl_awb: '',
    no_pol: '',
    keterangan: '',
    // New fields
    seri_out: 0,
    tgl_bl_awb: '',
    id_consignee: '',
    consignee: '',
    no_bc11: '',
    tgl_bc11: '',
    no_pos_bc11: '',
    no_dok_inout: '',
    tgl_dok_inout: '',
    kd_sar_angkut_inout: '',
    jenis_kemasan: '',
    jml_satuan: 0,
    jns_satuan: '',
    pel_muat: '',
    pel_transit: '',
    pel_bongkar: '',
    panjang: 0,
    lebar: 0,
    tinggi: 0,
    berat_kosong: 0,
    berat_isi: 0,
    lokasi_penempatan: '',
    wk_inout: '',
    tgl_produksi: '',
    tgl_expired: '',
    no_segel_bc: '',
    no_segel_perusahaan: '',
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportTangki = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('Apakah Anda yakin ingin mengimport data tangki dari file ini? Data akan ditambahkan ke dokumen ini.')) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/documents/${document.id}/import-tangki`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(`Berhasil mengimport ${result.count} data tangki.`)
        router.reload({ only: ['document'] })
      } else {
        alert('Gagal mengimport file: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error importing file:', error)
      alert('Terjadi kesalahan saat mengimport file.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

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

  const handleResendToHost = () => {
    if (confirm(`Kirim ULANG dokumen ke host dalam format ${transmissionFormat.toUpperCase()}?\n\nData sebelumnya akan di-overwrite.`)) {
      setIsResending(true)
      router.post(`/api/export/documents/${document.id}/resend-to-host`, {
        format: transmissionFormat
      }, {
        onSuccess: () => {
          setIsResending(false)
          router.reload({ only: ['document'] })
          fetchTransmissionHistory() // Refresh history
        },
        onError: (errors) => {
          setIsResending(false)
          console.error('Resend to host error:', errors)
        }
      })
    }
  }

  const fetchTransmissionHistory = async () => {
    try {
      const response = await fetch(`/api/export/documents/${document.id}/transmission-history`)
      const data = await response.json()
      if (data.success) {
        setTransmissionHistory(data.logs)
        setShowHistory(true)
      }
    } catch (error) {
      console.error('Failed to fetch transmission history:', error)
    }
  }

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('id-ID') : '-'
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  const calculatePercentage = (jumlah: number, kapasitas: number) => {
    if (kapasitas === 0) return 0
    return ((jumlah / kapasitas) * 100).toFixed(1)
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Documents', href: '/documents' },
      { title: document.ref_number, href: `/documents/${document.id}` }
    ]}>
      <Head title={`Document ${document.ref_number}`} />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.get('/documents')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {document.ref_number}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={statusConfig[document.status].variant}
                  className="flex items-center gap-1"
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[document.status].label}
                </Badge>
                <span className="text-sm text-slate-500">
                  Dibuat {formatDateTime(document.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {document.status === 'draft' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.get(`/documents/${document.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>

                <Button
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={() => window.open(`/api/export/documents/${document.id}/preview/xml`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview XML
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/api/export/documents/${document.id}/download/xml`, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download XML
            </Button>

            {/* Add Tangki modal trigger - available for Draft or Submitted documents */}
            {(document.status === 'draft' || document.status === 'submitted') && (
              <>
                <Button
                  variant="outline"
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
                  onChange={handleImportTangki}
                />
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Tambah Tangki</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle>Tambah Tangki</DialogTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <Label>No. Tangki *</Label>
                        <Input value={newTangki.no_tangki} onChange={(e) => setNewTangki({ ...newTangki, no_tangki: e.target.value })} placeholder="Nomor tangki" />
                      </div>

                      <div className="space-y-2">
                        <Label>Kode Dok IN/OUT *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={newTangki.kd_dok_inout}
                          onChange={(e) => setNewTangki({ ...newTangki, kd_dok_inout: e.target.value })}
                        >
                          <option value="">Pilih Kode Dok IN/OUT</option>
                          {kdDokInout?.map((item) => (
                            <option key={item.kd_dok_inout} value={item.kd_dok_inout}>
                              {item.kd_dok_inout} - {item.nm_dok_inout} {item.jenis ? `(${item.jenis})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Jenis Isi *</Label>
                        <Input value={newTangki.jenis_isi} onChange={(e) => setNewTangki({ ...newTangki, jenis_isi: e.target.value })} placeholder="Jenis isi" />
                      </div>

                      <div className="space-y-2">
                        <Label>Jenis Kemasan</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={newTangki.jenis_kemasan}
                          onChange={(e) => setNewTangki({ ...newTangki, jenis_kemasan: e.target.value })}
                        >
                          <option value="">Pilih Jenis Kemasan</option>
                          {jenisKemasan?.map((item) => (
                            <option key={item.kode_jenis_kemasan} value={item.kode_jenis_kemasan}>
                              {item.kode_jenis_kemasan} - {item.nama_jenis_kemasan}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Kapasitas *</Label>
                        <Input type="number" step="0.001" value={newTangki.kapasitas} onChange={(e) => setNewTangki({ ...newTangki, kapasitas: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Jumlah Isi *</Label>
                        <Input type="number" step="0.001" value={newTangki.jumlah_isi} onChange={(e) => setNewTangki({ ...newTangki, jumlah_isi: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Satuan *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={newTangki.satuan}
                          onChange={(e) => setNewTangki({ ...newTangki, satuan: e.target.value })}
                        >
                          <option value="LITER">LITER</option>
                          <option value="KGM">KGM</option>
                          <option value="M3">M3</option>
                          <option value="TON">TON</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Jumlah Satuan</Label>
                        <Input type="number" value={newTangki.jml_satuan} onChange={(e) => setNewTangki({ ...newTangki, jml_satuan: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Jenis Satuan</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={newTangki.jns_satuan}
                          onChange={(e) => setNewTangki({ ...newTangki, jns_satuan: e.target.value })}
                        >
                          <option value="">Pilih Jenis Satuan</option>
                          {jenisSatuan?.map((item) => (
                            <option key={item.kode_satuan_barang} value={item.kode_satuan_barang}>
                              {item.kode_satuan_barang} - {item.nama_satuan_barang}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Kondisi *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                          value={newTangki.kondisi}
                          onChange={(e) => setNewTangki({ ...newTangki, kondisi: e.target.value })}
                        >
                          <option value="BAIK">BAIK</option>
                          <option value="RUSAK">RUSAK</option>
                          <option value="BOCOR">BOCOR</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>No. BL/AWB</Label>
                        <Input value={newTangki.no_bl_awb} onChange={(e) => setNewTangki({ ...newTangki, no_bl_awb: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tgl. BL/AWB</Label>
                        <Input type="date" value={newTangki.tgl_bl_awb} onChange={(e) => setNewTangki({ ...newTangki, tgl_bl_awb: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>ID Consignee</Label>
                        <Input value={newTangki.id_consignee} onChange={(e) => setNewTangki({ ...newTangki, id_consignee: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Consignee</Label>
                        <Input value={newTangki.consignee} onChange={(e) => setNewTangki({ ...newTangki, consignee: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. BC11</Label>
                        <Input value={newTangki.no_bc11} onChange={(e) => setNewTangki({ ...newTangki, no_bc11: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tgl. BC11</Label>
                        <Input type="date" value={newTangki.tgl_bc11} onChange={(e) => setNewTangki({ ...newTangki, tgl_bc11: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. Pos BC11</Label>
                        <Input value={newTangki.no_pos_bc11} onChange={(e) => setNewTangki({ ...newTangki, no_pos_bc11: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. Dok In/Out</Label>
                        <Input value={newTangki.no_dok_inout} onChange={(e) => setNewTangki({ ...newTangki, no_dok_inout: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tgl. Dok In/Out</Label>
                        <Input type="date" value={newTangki.tgl_dok_inout} onChange={(e) => setNewTangki({ ...newTangki, tgl_dok_inout: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Kode Sarana Angkut</Label>
                        <Input value={newTangki.kd_sar_angkut_inout} onChange={(e) => setNewTangki({ ...newTangki, kd_sar_angkut_inout: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. Polisi</Label>
                        <Input value={newTangki.no_pol} onChange={(e) => setNewTangki({ ...newTangki, no_pol: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Pelabuhan Muat</Label>
                        <Input value={newTangki.pel_muat} onChange={(e) => setNewTangki({ ...newTangki, pel_muat: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Pelabuhan Transit</Label>
                        <Input value={newTangki.pel_transit} onChange={(e) => setNewTangki({ ...newTangki, pel_transit: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Pelabuhan Bongkar</Label>
                        <Input value={newTangki.pel_bongkar} onChange={(e) => setNewTangki({ ...newTangki, pel_bongkar: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Panjang (m)</Label>
                        <Input type="number" step="0.01" value={newTangki.panjang} onChange={(e) => setNewTangki({ ...newTangki, panjang: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Lebar (m)</Label>
                        <Input type="number" step="0.01" value={newTangki.lebar} onChange={(e) => setNewTangki({ ...newTangki, lebar: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tinggi (m)</Label>
                        <Input type="number" step="0.01" value={newTangki.tinggi} onChange={(e) => setNewTangki({ ...newTangki, tinggi: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Berat Kosong (kg)</Label>
                        <Input type="number" step="0.01" value={newTangki.berat_kosong} onChange={(e) => setNewTangki({ ...newTangki, berat_kosong: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Berat Isi (kg)</Label>
                        <Input type="number" step="0.01" value={newTangki.berat_isi} onChange={(e) => setNewTangki({ ...newTangki, berat_isi: parseFloat(e.target.value || '0') })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Lokasi Penempatan</Label>
                        <Input value={newTangki.lokasi_penempatan} onChange={(e) => setNewTangki({ ...newTangki, lokasi_penempatan: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Waktu In/Out</Label>
                        <Input type="datetime-local" value={newTangki.wk_inout} onChange={(e) => setNewTangki({ ...newTangki, wk_inout: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tgl. Produksi</Label>
                        <Input type="date" value={newTangki.tgl_produksi} onChange={(e) => setNewTangki({ ...newTangki, tgl_produksi: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>Tgl. Expired</Label>
                        <Input type="date" value={newTangki.tgl_expired} onChange={(e) => setNewTangki({ ...newTangki, tgl_expired: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. Segel BC</Label>
                        <Input value={newTangki.no_segel_bc} onChange={(e) => setNewTangki({ ...newTangki, no_segel_bc: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label>No. Segel Perusahaan</Label>
                        <Input value={newTangki.no_segel_perusahaan} onChange={(e) => setNewTangki({ ...newTangki, no_segel_perusahaan: e.target.value })} />
                      </div>

                      <div className="col-span-full space-y-2">
                        <Label>Keterangan</Label>
                        <Input value={newTangki.keterangan} onChange={(e) => setNewTangki({ ...newTangki, keterangan: e.target.value })} placeholder="Keterangan tambahan" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
                      <Button onClick={async () => {
                        // basic client-side validation
                        if (!newTangki.kd_dok_inout || !newTangki.no_tangki || !newTangki.jenis_isi) {
                          alert('Kode Dok IN/OUT, Nomor tangki dan Jenis isi wajib diisi');
                          return;
                        }
                        setIsAdding(true)
                        router.post(`/documents/${document.id}/tangki`, {
                          tangki: [newTangki]
                        }, {
                          onSuccess: () => {
                            setIsAdding(false)
                            setIsAddOpen(false)
                            router.reload({ only: ['document'] })
                          },
                          onError: (errors) => {
                            setIsAdding(false)
                            console.error('Add tangki error', errors)
                            alert('Gagal menambah tangki. Periksa input dan coba lagi.')
                          }
                        })
                      }}>
                        {isAdding ? 'Menambahkan...' : 'Tambah Tangki'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {(auth.user.roles?.some((role) => role.name === 'admin') ||
              auth.user.roles?.some((role) =>
                role.permissions?.some((perm) => perm.name === 'export.json')
              )
            ) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Preview JSON
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open(`/api/export/documents/${document.id}/download/json`, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>

                  {/* Send to Host with Format Selection */}
                  {document.status === 'approved' && (
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                      <Select value={transmissionFormat} onValueChange={(value: 'xml' | 'json') => setTransmissionFormat(value)}>
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xml">Format XML</SelectItem>
                          <SelectItem value="json">Format JSON</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* @ts-ignore - sent_to_host may not be in type */}
                      {!document.sent_to_host ? (
                        <Button
                          onClick={handleSendToHost}
                          disabled={isSending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isSending ? 'Mengirim...' : 'Send to Host'}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleResendToHost}
                            disabled={isResending}
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isResending ? 'Mengirim Ulang...' : 'Resend to Host'}
                          </Button>
                          <Button
                            onClick={fetchTransmissionHistory}
                            variant="outline"
                            size="sm"
                          >
                            History ({transmissionHistory.length || '?'})
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                </>
              )}
          </div>
        </div>

        {/* Transmission History Modal/Card */}
        {showHistory && transmissionHistory.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Riwayat Pengiriman ke Host ({transmissionHistory.length}x)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                ✕ Tutup
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transmissionHistory.map((log, index) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 bg-white dark:bg-slate-800 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'destructive' : 'secondary'}
                        className="min-w-[80px] justify-center"
                      >
                        {log.status === 'success' ? '✓ Success' : log.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          Pengiriman #{transmissionHistory.length - index}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.format.toUpperCase()}
                        </Badge>
                        {log.response_time && (
                          <span className="text-xs text-slate-500">
                            {log.response_time}ms
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <div>Dikirim: {log.sent_at}</div>
                        <div>Oleh: {log.sent_by}</div>
                        {log.transmission_size && (
                          <div>Ukuran: {(log.transmission_size / 1024).toFixed(2)} KB</div>
                        )}
                        {log.error_message && (
                          <div className="text-red-600 dark:text-red-400 mt-1">
                            Error: {log.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Details */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Header</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Kode Dokumen
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{document.kd_dok}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Kode TPS
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{document.kd_tps}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Nama Angkutan
                </label>
                <div className="mt-1 font-medium">
                  {document.nm_angkut?.nm_angkut}
                  {document.nm_angkut?.call_sign && (
                    <span className="text-slate-500 ml-2">
                      ({document.nm_angkut.call_sign})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Kode Gudang
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{document.kd_gudang}</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No. VOY/Flight
                </label>
                <div className="mt-1 font-medium">
                  {document.no_voy_flight || '-'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Tanggal Entry
                </label>
                <div className="mt-1 font-medium">
                  {formatDate(document.tgl_entry)} {document.jam_entry}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Tanggal Tiba
                </label>
                <div className="mt-1 font-medium">
                  {formatDate(document.tgl_tiba)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Gate In
                </label>
                <div className="mt-1 font-medium">
                  {document.tgl_gate_in ? `${formatDate(document.tgl_gate_in)} ${document.jam_gate_in || ''}` : '-'}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Gate Out
                </label>
                <div className="mt-1 font-medium">
                  {document.tgl_gate_out ? `${formatDate(document.tgl_gate_out)} ${document.jam_gate_out || ''}` : '-'}
                </div>
              </div>

              {document.keterangan && (
                <div className="col-span-full">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Keterangan
                  </label>
                  <div className="mt-1 font-medium">
                    {document.keterangan}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tangki Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Tangki ({document.tangki.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {document.tangki.map((tangki, index) => (
                <div key={tangki.id} className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Tangki #{index + 1}</h4>
                    <Badge variant="outline">{tangki.no_tangki}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Info */}
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No. BL/AWB
                      </label>
                      <div className="mt-1 font-medium">{tangki.no_bl_awb || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Tgl. BL/AWB
                      </label>
                      <div className="mt-1 font-medium">{formatDate(tangki.tgl_bl_awb)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Consignee
                      </label>
                      <div className="mt-1 font-medium">{tangki.consignee || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No. BC11
                      </label>
                      <div className="mt-1 font-medium">{tangki.no_bc11 || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Tgl. BC11
                      </label>
                      <div className="mt-1 font-medium">{formatDate(tangki.tgl_bc11)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No. Pos BC11
                      </label>
                      <div className="mt-1 font-medium">{tangki.no_pos_bc11 || '-'}</div>
                    </div>

                    {/* Dok InOut Info */}
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Kode Dok In/Out
                      </label>
                      <div className="mt-1 font-medium">{tangki.kd_dok_inout || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No. Dok In/Out
                      </label>
                      <div className="mt-1 font-medium">{tangki.no_dok_inout || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Tgl. Dok In/Out
                      </label>
                      <div className="mt-1 font-medium">{formatDate(tangki.tgl_dok_inout)}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No. Polisi
                      </label>
                      <div className="mt-1 font-medium">{tangki.no_pol || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Seri Out
                      </label>
                      <div className="mt-1 font-medium">{tangki.seri_out || '-'}</div>
                    </div>

                    {/* Content Info */}
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Jenis Isi
                      </label>
                      <div className="mt-1 font-medium">{tangki.jenis_isi}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Jenis Kemasan
                      </label>
                      <div className="mt-1 font-medium">{tangki.jenis_kemasan || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Kondisi
                      </label>
                      <div className="mt-1">
                        <Badge variant={tangki.kondisi === 'BAIK' ? 'success' : 'destructive'}>
                          {tangki.kondisi}
                        </Badge>
                      </div>
                    </div>

                    {/* Capacity Info */}
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Kapasitas
                      </label>
                      <div className="mt-1 font-medium">
                        {tangki.kapasitas.toLocaleString('id-ID')} {tangki.satuan}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Jumlah Isi
                      </label>
                      <div className="mt-1 font-medium">
                        {tangki.jumlah_isi.toLocaleString('id-ID')} {tangki.satuan}
                        <span className="text-sm text-slate-500 ml-2">
                          ({calculatePercentage(tangki.jumlah_isi, tangki.kapasitas)}%)
                        </span>
                      </div>
                    </div>

                    {/* Pelabuhan */}
                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Pelabuhan Muat
                      </label>
                      <div className="mt-1 font-medium">{tangki.pel_muat || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Pelabuhan Transit
                      </label>
                      <div className="mt-1 font-medium">{tangki.pel_transit || '-'}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Pelabuhan Bongkar
                      </label>
                      <div className="mt-1 font-medium">{tangki.pel_bongkar || '-'}</div>
                    </div>

                    {/* Dimensi (jika ada) */}
                    {(tangki.panjang || tangki.lebar || tangki.tinggi) && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Dimensi (P x L x T)
                          </label>
                          <div className="mt-1 font-medium">
                            {tangki.panjang || 0} x {tangki.lebar || 0} x {tangki.tinggi || 0} m
                          </div>
                        </div>
                      </>
                    )}

                    {/* Berat (jika ada) */}
                    {(tangki.berat_kosong || tangki.berat_isi) && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Berat Kosong
                          </label>
                          <div className="mt-1 font-medium">
                            {tangki.berat_kosong ? `${tangki.berat_kosong.toLocaleString('id-ID')} kg` : '-'}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Berat Isi
                          </label>
                          <div className="mt-1 font-medium">
                            {tangki.berat_isi ? `${tangki.berat_isi.toLocaleString('id-ID')} kg` : '-'}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Segel */}
                    {(tangki.no_segel_bc || tangki.no_segel_perusahaan) && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            No. Segel BC
                          </label>
                          <div className="mt-1 font-medium">{tangki.no_segel_bc || '-'}</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            No. Segel Perusahaan
                          </label>
                          <div className="mt-1 font-medium">{tangki.no_segel_perusahaan || '-'}</div>
                        </div>
                      </>
                    )}

                    {/* Tanggal */}
                    {(tangki.tgl_produksi || tangki.tgl_expired) && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Tgl. Produksi
                          </label>
                          <div className="mt-1 font-medium">{formatDate(tangki.tgl_produksi)}</div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Tgl. Expired
                          </label>
                          <div className="mt-1 font-medium">{formatDate(tangki.tgl_expired)}</div>
                        </div>
                      </>
                    )}

                    {tangki.lokasi_penempatan && (
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Lokasi Penempatan
                        </label>
                        <div className="mt-1 font-medium">{tangki.lokasi_penempatan}</div>
                      </div>
                    )}

                    {tangki.keterangan && (
                      <div className="col-span-full">
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Keterangan
                        </label>
                        <div className="mt-1 font-medium">{tangki.keterangan}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}


