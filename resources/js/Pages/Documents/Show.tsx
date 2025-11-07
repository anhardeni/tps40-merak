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
  Upload
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
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
  submitted: { label: 'Disubmit', variant: 'default' as const, icon: Send },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Selesai', variant: 'success' as const, icon: CheckCircle }
};

export default function ShowDocument({ auth, document }: ShowDocumentProps) {
  const StatusIcon = statusConfig[document.status].icon
  const [transmissionFormat, setTransmissionFormat] = useState<'xml' | 'json'>('xml')
  const [isSending, setIsSending] = useState(false)

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
                    
                    <Button
                      onClick={handleSendToHost}
                      disabled={isSending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isSending ? 'Mengirim...' : 'Send to Host'}
                    </Button>
                  </div>
                )}
                
              </>
            )}
          </div>
        </div>

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


