import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
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
  Eye,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShieldAlert,
  Copy,
  Calendar,
  X
} from "lucide-react"

interface KontainerDocument {
  id: number
  ref_number: string
  kd_dok: string
  kd_tps: string
  kd_gudang: string
  tgl_tiba: string
  status: string
  created_at: string
  kontainers_count: number
}

interface IndexProps extends PageProps {
  documents: {
    data: KontainerDocument[]
    links: any[]
    meta: any
  }
  filters: {
    search?: string
    status?: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'success' | 'destructive' | 'outline' | 'ghost'; icon: any; colorClass: string }> = {
  'DRAFT': { label: 'Draft', variant: 'secondary', icon: Clock, colorClass: 'bg-slate-100 text-slate-700' },
  'SUCCESS': { label: 'Berhasil', variant: 'success', icon: CheckCircle, colorClass: 'bg-emerald-100 text-emerald-700' },
  'REJECTED': { label: 'Ditolak', variant: 'destructive', icon: XCircle, colorClass: 'bg-rose-100 text-rose-700' },
  'RETRY_LATER': { label: 'Tunda/Retry', variant: 'default', icon: AlertCircle, colorClass: 'bg-amber-100 text-amber-700' },
  'AUTH_ERROR': { label: 'Error Auth', variant: 'destructive', icon: ShieldAlert, colorClass: 'bg-purple-100 text-purple-700' },
  'DUPLICATE': { label: 'Duplikat', variant: 'outline', icon: Copy, colorClass: 'bg-blue-100 text-blue-700' },
}

export default function Index({ auth, documents, filters }: IndexProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')

  const handleSearch = () => {
    router.get('/kontainer', {
      search: search || undefined,
      status: status || undefined,
    }, {
      preserveState: true,
      replace: true
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('')
    router.get('/kontainer', {}, {
      preserveState: true,
      replace: true
    })
  }

  const handleSubmit = (id: number) => {
    if (confirm('Kirim data ini ke API Beacukai?')) {
      router.post(`/kontainer/${id}/submit`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Kontainer', href: '/kontainer' }
    ]}>
      <Head title="Kontainer REST" />

      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Kontainer Integration
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              OpenAPI REST Coarri Discharge (Dahulu SOAP)
            </p>
          </div>
          <Button
            onClick={() => router.get('/kontainer/create')}
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
            Entry Kontainer Baru
          </Button>
        </div>

        {/* Filter Card */}
        <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="search" className="text-[10px] font-bold uppercase text-slate-400 ml-1">Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Cari Ref Number..."
                    className="pl-9 h-10 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className="w-full md:w-48 space-y-1.5">
                <Label htmlFor="status" className="text-[10px] font-bold uppercase text-slate-400 ml-1">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-slate-600"
                >
                  <option value="">Semua Status</option>
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset} className="h-10 w-10 rounded-xl p-0">
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={handleSearch} className="h-10 px-6 rounded-xl bg-slate-900 text-white font-bold">
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="border-none shadow-xl rounded-3xl bg-white dark:bg-slate-900 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ref Number / Created</th>
                    <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">TPS / Gudang</th>
                    <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tgl Tiba</th>
                    <th className="text-center p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                    <th className="text-left p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status REST</th>
                    <th className="text-right p-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {documents.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                        Belum ada data kontainer.
                      </td>
                    </tr>
                  ) : (
                    documents.data.map((doc) => {
                      const config = statusConfig[doc.status] || { label: doc.status, variant: 'secondary', icon: AlertCircle, colorClass: 'bg-slate-100 text-slate-600' }
                      const StatusIcon = config.icon
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{doc.ref_number}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{formatDate(doc.created_at)}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs font-bold text-slate-700">{doc.kd_tps}</div>
                            <div className="text-[10px] text-slate-400">{doc.kd_gudang}</div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-600">
                            {formatDate(doc.tgl_tiba)}
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="secondary" className="font-black text-indigo-600">{doc.kontainers_count}</Badge>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${config.colorClass}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => router.get(`/kontainer/${doc.id}`)} className="h-8 w-8 p-0 rounded-lg">
                                <Eye className="w-4 h-4 text-slate-400" />
                              </Button>
                              
                              {doc.status !== 'SUCCESS' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleSubmit(doc.id)} 
                                  className="h-8 w-8 p-0 rounded-lg bg-indigo-50 hover:bg-indigo-100"
                                  title="Submit ke Beacukai"
                                >
                                  <Send className="w-4 h-4 text-indigo-600" />
                                </Button>
                              )}

                              {doc.status === 'DRAFT' && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50 group">
                                  <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder (similar to existing) */}
            {documents.links && documents.links.length > 3 && (
              <div className="p-4 border-t flex justify-between items-center bg-slate-50/30">
                <div className="text-xs text-slate-400">Total {documents.meta.total} records</div>
                <div className="flex gap-1">
                   {/* Simplified pagination for brevity, in real usage would map links */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
