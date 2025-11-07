import React, { useState } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import AppLayout from '@/Layouts/app-layout'
import {
  Send,
  Download,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Truck,
  Info,
  Database,
  MapPin
} from "lucide-react"

interface Tangki {
  id: number
  no_tangki: string
  kap_tangki: number
  jns_isi: string
  kd_tps: string
  kode_kms: string
  ur_brg: string
  asal_brg: string
  volume: number
  teus: number
  berat: number
  density?: number
  seri_in?: string
  tgl_in?: string
  jam_in?: string
  seri_out?: string
  tgl_out?: string
  jam_out?: string
  no_bl_awb?: string
  consignee?: string
  pel_muat?: string
  tgl_muat?: string
}

interface Document {
  id: number
  ref_number: string
  kd_dok: string
  tgl_dok: string
  nm_pengangkut?: string
  no_voy_flight?: string
  call_sign?: string
  tgl_tiba?: string
  pel_asal?: string
  pel_transit?: string
  pel_bongkar?: string
  kd_gudang?: string
  nm_gudang?: string
  kd_tps?: string
  nm_tps?: string
  status: string
  tangki: Tangki[]
  cocotangki_status?: string
  cocotangki_sent_at?: string
  cocotangki_response?: string
  cocotangki_error?: string
  validation_result?: {
    valid: boolean
    errors: string[]
    warnings: string[]
  }
  xml_preview?: string
}

interface Props {
  document: Document
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'CoCoTangki', href: '/cocotangki' },
  { title: 'Detail', href: '#' }
]

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'sent':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Terkirim</Badge>
    case 'error':
      return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Belum Kirim</Badge>
  }
}

export default function CoCoTangkiShow({ document }: Props) {
  const [xmlVisible, setXmlVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('document')

  const handleSend = () => {
    if (confirm('Kirim dokumen ini ke CoCoTangki?')) {
      router.post(`/cocotangki/${document.id}/send`, {}, {
        onSuccess: () => router.reload({ only: ['document'] })
      })
    }
  }

  const handleRetry = () => {
    if (confirm('Kirim ulang dokumen ini ke CoCoTangki?')) {
      router.post(`/cocotangki/${document.id}/retry`, {}, {
        onSuccess: () => router.reload({ only: ['document'] })
      })
    }
  }

  const handleGenerateXml = () => {
    router.get(`/cocotangki/${document.id}/generate-xml`, {}, {
      onSuccess: () => setXmlVisible(true)
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`CoCoTangki - ${document.ref_number}`} />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/cocotangki">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                CoCoTangki - {document.ref_number}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Detail dokumen dan status pengiriman CoCoTangki
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.get(`/cocotangki/${document.id}/download`)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download XML
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerateXml}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview XML
            </Button>
            {(!document.cocotangki_status || document.cocotangki_status === 'error') && (
              <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                {document.cocotangki_status === 'error' ? 'Kirim Ulang' : 'Kirim'}
              </Button>
            )}
            {document.cocotangki_status === 'error' && (
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Dokumen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge 
                variant={document.status === 'APPROVED' ? 'default' : 'secondary'}
                className={
                  document.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  document.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {document.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status CoCoTangki</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {getStatusBadge(document.cocotangki_status)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jumlah Tangki</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{document.tangki.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tanggal Kirim</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {document.cocotangki_sent_at 
                  ? new Date(document.cocotangki_sent_at).toLocaleString('id-ID')
                  : 'Belum dikirim'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {document.cocotangki_error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                Error CoCoTangki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-700 text-sm">
                {document.cocotangki_error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Response */}
        {document.cocotangki_response && document.cocotangki_status === 'sent' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Response CoCoTangki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700 text-sm">
                {document.cocotangki_response}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Results */}
        {document.validation_result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Hasil Validasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {document.validation_result.valid ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Tidak Valid
                    </Badge>
                  )}
                </div>

                {document.validation_result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {document.validation_result.errors.map((error, index) => (
                        <li key={index} className="text-red-600 text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {document.validation_result.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {document.validation_result.warnings.map((warning, index) => (
                        <li key={index} className="text-yellow-600 text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="space-y-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['document', 'tangki', 'xml'].map((tab) => {
                const isActive = activeTab === tab
                const tabNames = {
                  document: 'Data Dokumen',
                  tangki: 'Data Tangki', 
                  xml: 'Preview XML'
                }
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tabNames[tab as keyof typeof tabNames]}
                  </button>
                )
              })}
            </nav>
          </div>

          {activeTab === 'document' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Nomor Referensi</label>
                      <div className="text-lg font-mono">{document.ref_number}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Kode Dokumen</label>
                      <div>{document.kd_dok}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Tanggal Dokumen</label>
                      <div>{new Date(document.tgl_dok).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Nama Pengangkut</label>
                      <div>{document.nm_pengangkut || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">No. Voyage/Flight</label>
                      <div>{document.no_voy_flight || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Call Sign</label>
                      <div>{document.call_sign || '-'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Tanggal Tiba</label>
                      <div>{document.tgl_tiba ? new Date(document.tgl_tiba).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Pelabuhan Asal</label>
                      <div>{document.pel_asal || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Pelabuhan Transit</label>
                      <div>{document.pel_transit || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Pelabuhan Bongkar</label>
                      <div>{document.pel_bongkar || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Gudang TPS</label>
                      <div>{document.nm_gudang || document.kd_gudang || '-'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">TPS</label>
                      <div>{document.nm_tps || document.kd_tps || '-'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'tangki' && (
            <Card>
              <CardHeader>
                <CardTitle>Data Tangki ({document.tangki.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tangki</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Jenis Isi</TableHead>
                      <TableHead>Uraian Barang</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Berat</TableHead>
                      <TableHead>Seri In/Out</TableHead>
                      <TableHead>Consignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {document.tangki.map((tangki) => (
                      <TableRow key={tangki.id}>
                        <TableCell className="font-mono">{tangki.no_tangki}</TableCell>
                        <TableCell>{tangki.kap_tangki.toLocaleString()}</TableCell>
                        <TableCell>{tangki.jns_isi}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm font-medium">{tangki.ur_brg}</div>
                            <div className="text-xs text-slate-500">{tangki.asal_brg}</div>
                          </div>
                        </TableCell>
                        <TableCell>{tangki.volume.toLocaleString()}</TableCell>
                        <TableCell>{tangki.berat.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>In: {tangki.seri_in || '-'}</div>
                            <div>Out: {tangki.seri_out || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {tangki.consignee || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'xml' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Preview XML CoCoTangki
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateXml}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {document.xml_preview ? (
                  <div className="bg-slate-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-800">
                      <code>{document.xml_preview}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Klik "Generate" untuk melihat preview XML</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}