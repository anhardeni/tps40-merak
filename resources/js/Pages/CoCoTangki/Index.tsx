import React, { useState } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import AppLayout from '@/Layouts/app-layout'
import {
  Send,
  Download,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Search,
  RefreshCw,
  Truck
} from "lucide-react"

interface Document {
  id: number
  ref_number: string
  kd_dok: string
  nm_angkut?: {
    nm_angkut: string
  }
  status: string
  tangki_count: number
  cocotangki_status?: string
  cocotangki_sent_at?: string
  cocotangki_error?: string
  created_at: string
}

interface Props {
  documents: {
    data: Document[]
    links: any[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: {
    total_documents: number
    not_sent: number
    sent: number
    error: number
    ready_to_send: number
  }
  filters: {
    search?: string
    status?: string
    cocotangki_status?: string
  }
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'CoCoTangki', href: '/cocotangki' }
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

export default function CoCoTangkiIndex({ documents, stats, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [cocotangkiStatus, setCoCoTangkiStatus] = useState(filters.cocotangki_status || '')
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])

  const handleSearch = () => {
    router.get('/cocotangki', { 
      search, 
      status, 
      cocotangki_status: cocotangkiStatus 
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setCoCoTangkiStatus('')
    router.get('/cocotangki')
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.data.map(doc => doc.id))
    } else {
      setSelectedDocuments([])
    }
  }

  const handleSelectDocument = (documentId: number, checked: boolean) => {
    if (checked) {
      setSelectedDocuments([...selectedDocuments, documentId])
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId))
    }
  }

  const handleSendDocument = (documentId: number) => {
    router.post(`/cocotangki/${documentId}/send`, {}, {
      onSuccess: () => router.reload({ only: ['documents', 'stats'] })
    })
  }

  const handleBulkSend = () => {
    if (selectedDocuments.length === 0) {
      alert('Pilih dokumen yang akan dikirim')
      return
    }

    if (confirm(`Kirim ${selectedDocuments.length} dokumen ke CoCoTangki?`)) {
      router.post('/cocotangki/send-bulk', {
        document_ids: selectedDocuments
      }, {
        onSuccess: () => {
          setSelectedDocuments([])
          router.reload({ only: ['documents', 'stats'] })
        }
      })
    }
  }

  const handleRetry = (documentId: number) => {
    router.post(`/cocotangki/${documentId}/retry`, {}, {
      onSuccess: () => router.reload({ only: ['documents', 'stats'] })
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="CoCoTangki - Laporan Barang Curah Tangki" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              CoCoTangki
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Laporan data Coarri dan Codeco dari barang curah yang ditimbun dalam tangki penimbunan
            </p>
          </div>
          <div className="flex gap-2">
            {selectedDocuments.length > 0 && (
              <Button onClick={handleBulkSend} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Kirim {selectedDocuments.length} Dokumen
              </Button>
            )}
            <Button variant="outline" onClick={() => router.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_documents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Siap Kirim</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.ready_to_send}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Kirim</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.not_sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Cari dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status Dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={cocotangkiStatus} onValueChange={setCoCoTangkiStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status CoCoTangki" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_sent">Belum Kirim</SelectItem>
                    <SelectItem value="sent">Terkirim</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Cari
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Dokumen CoCoTangki ({documents.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documents.data.length && documents.data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Dokumen</TableHead>
                  <TableHead>Angkutan</TableHead>
                  <TableHead>Tangki</TableHead>
                  <TableHead>Status Dokumen</TableHead>
                  <TableHead>Status CoCoTangki</TableHead>
                  <TableHead>Tanggal Kirim</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.data.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={(e) => handleSelectDocument(document.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.ref_number}</div>
                        <div className="text-sm text-slate-500">
                          KD_DOK: {document.kd_dok}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {document.nm_angkut?.nm_angkut || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {document.tangki_count} tangki
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(document.cocotangki_status)}
                      {document.cocotangki_error && (
                        <div className="text-xs text-red-600 mt-1">
                          {document.cocotangki_error.substring(0, 50)}...
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {document.cocotangki_sent_at 
                          ? new Date(document.cocotangki_sent_at).toLocaleString('id-ID')
                          : '-'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          
                          <DropdownMenuItem onClick={() => router.get(`/cocotangki/${document.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => router.get(`/cocotangki/${document.id}/download`)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download XML
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {(!document.cocotangki_status || document.cocotangki_status === 'error') && (
                            <DropdownMenuItem onClick={() => handleSendDocument(document.id)}>
                              <Send className="mr-2 h-4 w-4" />
                              {document.cocotangki_status === 'error' ? 'Kirim Ulang' : 'Kirim'}
                            </DropdownMenuItem>
                          )}
                          
                          {document.cocotangki_status === 'error' && (
                            <DropdownMenuItem onClick={() => handleRetry(document.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {documents.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">
                  Menampilkan {((documents.current_page - 1) * documents.per_page) + 1} hingga{' '}
                  {Math.min(documents.current_page * documents.per_page, documents.total)} dari{' '}
                  {documents.total} dokumen
                </div>
                <div className="flex gap-2">
                  {documents.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}