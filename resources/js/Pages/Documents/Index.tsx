import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { PageProps } from '@/types'
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  FileJson,
  Calendar
} from "lucide-react"

interface Document {
  id: number
  ref_number: string
  kd_dok: string
  kd_tps: string
  nm_angkut: { nm_angkut: string }
  kd_gudang: string
  no_voy_flight?: string
  tgl_entry: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'
  created_at: string
  tangki_count: number
}

interface IndexDocumentProps extends PageProps {
  documents: {
    data: Document[]
    links: any[]
    meta: any
  }
  filters: {
    search?: string
    status?: string
    kd_dok?: string
    kd_tps?: string
    date_from?: string
    date_to?: string
    tgl_tiba_from?: string
    tgl_tiba_to?: string
  }
}

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
  DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: Clock },
  submitted: { label: 'Disubmit', variant: 'default' as const, icon: Send },
  approved: { label: 'Disetujui', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Selesai', variant: 'success' as const, icon: CheckCircle }
}

// Helper function to get status config with fallback
const getStatusConfig = (status: string) => {
  return statusConfig[status] || statusConfig[status?.toLowerCase()] || statusConfig.draft
}

// Helper function to format date as YYYY-MM-DD
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Get default date range (6 months ago to today)
const getDefaultDateFrom = (): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - 6)
  return formatDateForInput(date)
}

const getDefaultDateTo = (): string => {
  return formatDateForInput(new Date())
}

// Get default arrival date range (90 days ago to today)
const getDefaultTglTibaFrom = (): string => {
  const date = new Date()
  date.setDate(date.getDate() - 90)
  return formatDateForInput(date)
}

export default function IndexDocument({ auth, documents, filters }: IndexDocumentProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [dateFrom, setDateFrom] = useState(filters.date_from || getDefaultDateFrom())
  const [dateTo, setDateTo] = useState(filters.date_to || getDefaultDateTo())
  const [tglTibaFrom, setTglTibaFrom] = useState(filters.tgl_tiba_from || getDefaultTglTibaFrom())
  const [tglTibaTo, setTglTibaTo] = useState(filters.tgl_tiba_to || getDefaultDateTo())

  const handleSearch = () => {
    router.get('/documents', {
      search: search || undefined,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      tgl_tiba_from: tglTibaFrom || undefined,
      tgl_tiba_to: tglTibaTo || undefined
    }, {
      preserveState: true,
      replace: true
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    setTglTibaFrom('')
    setTglTibaTo('')
    router.get('/documents', {}, {
      preserveState: true,
      replace: true
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      router.delete(`/documents/${id}`)
    }
  }

  const handleSubmit = (id: number) => {
    if (confirm('Apakah Anda yakin ingin submit dokumen ini?')) {
      router.post(`/documents/${id}/submit`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Documents', href: '/documents' }
    ]}>
      <Head title="Documents" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Dokumen TPS
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Kelola dokumen Tempat Penimbunan Sementara
            </p>
          </div>
          <Button onClick={() => router.get('/documents/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Dokumen
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Pencarian</Label>
                <Input
                  id="search"
                  placeholder="Cari ref number, kode dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Disubmit</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {/* Special Colorful Date Filter Box */}


              {/* Special Colorful Arrival Date Filter Box */}
              <div className="lg:col-span-2 rounded-xl p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/40 border border-emerald-200/50 dark:border-emerald-700/30 shadow-sm relative overflow-hidden">
                {/* Decorative gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 pointer-events-none" />

                {/* Header badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs font-medium shadow-sm">
                    <Calendar className="w-3 h-3" />
                    Rentang Tgl Tiba
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-300/50 via-teal-300/30 to-transparent dark:from-emerald-600/30 dark:via-teal-600/20" />
                </div>

                <div className="grid grid-cols-2 gap-3 relative">
                  <div className="space-y-1.5">
                    <Label htmlFor="tglTibaFrom" className="text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Dari
                    </Label>
                    <Input
                      id="tglTibaFrom"
                      type="date"
                      value={tglTibaFrom}
                      onChange={(e) => setTglTibaFrom(e.target.value)}
                      className="w-full bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-700/50 focus:border-emerald-400 focus:ring-emerald-400/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tglTibaTo" className="text-xs font-medium text-sky-700 dark:text-sky-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Sampai
                    </Label>
                    <Input
                      id="tglTibaTo"
                      type="date"
                      value={tglTibaTo}
                      onChange={(e) => setTglTibaTo(e.target.value)}
                      className="w-full bg-white/80 dark:bg-slate-900/80 border-sky-200 dark:border-sky-700/50 focus:border-sky-400 focus:ring-sky-400/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={handleReset}>
                Reset Filter
              </Button>
              <Button size="lg" className="w-full sm:w-auto" onClick={handleSearch}>
                <Search className="w-5 h-5 mr-2" />
                Cari Dokumen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Dokumen ({documents.meta.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p>Tidak ada dokumen ditemukan</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.get('/documents/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Dokumen Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Ref Number</th>
                          <th className="text-left p-4 font-medium">Kode Dok</th>
                          <th className="text-left p-4 font-medium">TPS</th>
                          <th className="text-left p-4 font-medium">Angkutan</th>
                          <th className="text-left p-4 font-medium">VOY/Flight</th>
                          <th className="text-left p-4 font-medium">Tgl Entry</th>
                          <th className="text-left p-4 font-medium">Tangki</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.data.map((document) => {
                          const config = getStatusConfig(document.status)
                          const StatusIcon = config.icon
                          return (
                            <tr key={document.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                              <td className="p-4">
                                <div className="font-mono text-sm">{document.ref_number}</div>
                                <div className="text-xs text-slate-500">
                                  {formatDateTime(document.created_at)}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{document.kd_dok}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{document.kd_tps}</Badge>
                              </td>
                              <td className="p-4">
                                {document.nm_angkut?.nm_angkut || '-'}
                              </td>
                              <td className="p-4">{document.no_voy_flight || '-'}</td>
                              <td className="p-4">{formatDate(document.tgl_entry)}</td>
                              <td className="p-4">
                                <Badge variant="secondary">{document.tangki_count}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={config.variant}
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {config.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(`/documents/${document.id}`)}
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  {document.status === 'draft' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.get(`/documents/${document.id}/edit`)}
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSubmit(document.id)}
                                        title="Submit"
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(document.id)}
                                        title="Hapus"
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/api/export/documents/${document.id}/download/xml`, '_blank')}
                                    title="Download XML"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>

                                  {(auth.user.roles?.some((role) => role.name === 'admin') ||
                                    auth.user.roles?.some((role) =>
                                      role.permissions?.some((perm) => perm.name === 'export.json')
                                    )
                                  ) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
                                        title="Preview JSON"
                                      >
                                        <FileJson className="w-4 h-4" />
                                      </Button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile view */}
                <div className="lg:hidden space-y-4">
                  {documents.data.map((document) => {
                    const config = getStatusConfig(document.status)
                    const StatusIcon = config.icon
                    return (
                      <Card key={document.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-mono text-sm font-medium">{document.ref_number}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {formatDateTime(document.created_at)}
                            </div>
                          </div>
                          <Badge
                            variant={config.variant}
                            className="flex items-center gap-1"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-slate-500">Kode Dok:</span>
                            <Badge variant="outline" className="ml-1">{document.kd_dok}</Badge>
                          </div>
                          <div>
                            <span className="text-slate-500">TPS:</span>
                            <Badge variant="outline" className="ml-1">{document.kd_tps}</Badge>
                          </div>
                          <div>
                            <span className="text-slate-500">Tangki:</span>
                            <Badge variant="secondary" className="ml-1">{document.tangki_count}</Badge>
                          </div>
                          <div>
                            <span className="text-slate-500">Tgl Entry:</span>
                            <span className="ml-1">{formatDate(document.tgl_entry)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(`/documents/${document.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>

                          {document.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.get(`/documents/${document.id}/edit`)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/export/documents/${document.id}/download/xml`, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>

                          {(auth.user.roles?.some((role) => role.name === 'admin') ||
                            auth.user.roles?.some((role) =>
                              role.permissions?.some((perm) => perm.name === 'export.json')
                            )
                          ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/api/export/documents/${document.id}/preview/json`, '_blank')}
                                title="Preview JSON"
                              >
                                <FileJson className="w-4 h-4" />
                              </Button>
                            )}
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination */}
                {documents.links && documents.links.length > 3 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Menampilkan {documents.meta.from} - {documents.meta.to} dari {documents.meta.total} dokumen
                    </div>
                    <div className="flex items-center gap-2">
                      {documents.links.map((link, index) => (
                        link.url && (
                          <Button
                            key={index}
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            onClick={() => router.get(link.url)}
                            disabled={!link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

