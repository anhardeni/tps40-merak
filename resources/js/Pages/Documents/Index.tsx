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
  Calendar,
  X
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
  }
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive'; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Clock },
  submitted: { label: 'Disubmit', variant: 'default', icon: Send },
  approved: { label: 'Disetujui', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Ditolak', variant: 'destructive', icon: XCircle },
  completed: { label: 'Selesai', variant: 'success', icon: CheckCircle }
}

export default function IndexDocument({ auth, documents, filters }: IndexDocumentProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [dateFrom, setDateFrom] = useState(filters.date_from || '')
  const [dateTo, setDateTo] = useState(filters.date_to || '')

  const handleSearch = () => {
    router.get('/documents', {
      search: search || undefined,
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
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
          <Button
            onClick={() => router.get('/documents/create')}
            className="h-14 px-10 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 hover:from-orange-500 hover:via-orange-600 hover:to-amber-700 text-white font-black text-base shadow-2xl shadow-orange-500/40 border-none transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Plus className="w-6 h-6 mr-3 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
            <span className="tracking-tighter">ENTRY DOKUMEN BARU</span>
          </Button>
        </div>

        {/* Unified Soft-Premium Filter Box */}
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 w-full" />
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">

              {/* Search Field - Takes 4/12 */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <Label htmlFor="search" className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Pencarian Cepat</Label>
                </div>
                <div className="relative group/search">
                  <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                  <Input
                    id="search"
                    placeholder="Ref No, Kode Dok, atau angkutan..."
                    className="pl-11 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Status Field - Takes 2/12 */}
              <div className="lg:col-span-2 space-y-2.5">
                <Label htmlFor="status" className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-12 w-full rounded-2xl border-none bg-slate-50 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-600 shadow-inner appearance-none cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Disubmit</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {/* Date Box - Unified Section - Takes 4/12 */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/30 relative overflow-hidden group/date mt-4 lg:mt-0">
                <div className="absolute top-0 right-0 p-1 opacity-10">
                  <Calendar className="w-8 h-8 text-orange-500 rotate-12" />
                </div>
                <div className="space-y-1.5 relative z-10">
                  <Label className="text-[10px] font-black uppercase text-orange-500 dark:text-orange-400 tracking-tighter ml-1">Dari Tgl</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 rounded-xl border-none bg-white/90 dark:bg-slate-900/50 focus:ring-2 focus:ring-orange-500/20 transition-all text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5 relative z-10">
                  <Label className="text-[10px] font-black uppercase text-orange-500 dark:text-orange-400 tracking-tighter ml-1">Sampai Tgl</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 rounded-xl border-none bg-white/90 dark:bg-slate-900/50 focus:ring-2 focus:ring-orange-500/20 transition-all text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions - Takes 2/12 */}
              <div className="lg:col-span-2 flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="h-12 w-12 rounded-2xl hover:bg-rose-50 hover:text-rose-500 shrink-0 border border-slate-100 dark:border-slate-800 transition-colors"
                  title="Reset Filter"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSearch}
                  className="h-12 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4 mr-2" />
                  FILTER
                </Button>
              </div>
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
                          const StatusIcon = statusConfig[document.status.toLowerCase()]?.icon || Clock
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
                              <td className="truncate text-xs leading-tight">
                                {document.nm_angkut?.nm_angkut || '-'}
                              </td>
                              <td className="p-4">{document.no_voy_flight || '-'}</td>
                              <td className="p-4">{formatDate(document.tgl_entry)}</td>
                              <td className="p-4">
                                <Badge variant="secondary">{document.tangki_count}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={statusConfig[document.status.toLowerCase()]?.variant || 'secondary'}
                                  className="flex items-center gap-1 w-fit"
                                >
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig[document.status.toLowerCase()]?.label || document.status}
                                </Badge>
                              </td><td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(`/documents/${document.id}`)}
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>

                                  {document.status.toLowerCase() === 'draft' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.get(`/documents/${document.id}/edit`)}
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4 text-blue-500" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSubmit(document.id)}
                                        title="Submit"
                                      >
                                        <Send className="w-4 h-4 text-emerald-500" />
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(document.id)}
                                        title="Hapus"
                                        className="text-rose-500 hover:text-rose-600"
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
                    const StatusIcon = statusConfig[document.status.toLowerCase()]?.icon || Clock
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
                            variant={statusConfig[document.status.toLowerCase()]?.variant || 'secondary'}
                            className="flex items-center gap-1"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[document.status.toLowerCase()]?.label || document.status}
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

                          {document.status.toLowerCase() === 'draft' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(`/documents/${document.id}/edit`)}
                              >
                                <Edit className="w-4 h-4 mr-1 text-blue-500" />
                                Edit
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubmit(document.id)}
                              >
                                <Send className="w-4 h-4 mr-1 text-emerald-500" />
                                Submit
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(document.id)}
                                className="text-rose-500 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Hapus
                              </Button>
                            </>
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

