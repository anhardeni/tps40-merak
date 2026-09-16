import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { PageProps } from '@/types'
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Label } from "@/Components/ui/label"
import {
  ArrowLeft,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Info,
  ExternalLink,
  Code
} from "lucide-react"

interface Kontainer {
  id: number
  no_kontainer: string
  ukuran_kontainer: string
  no_segel: string
  jns_kontainer: string
  bruto: number
  wk_inout: string
}

interface KontainerDocument {
  id: number
  ref_number: string
  kd_dok: string
  kd_tps: string
  kd_gudang: string
  tgl_tiba: string
  no_bc11: string
  tgl_bc11: string
  status: string
  keterangan?: string
  response_data?: any
  created_at: string
  kontainers: Kontainer[]
}

interface Props extends PageProps {
  document: KontainerDocument
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  'DRAFT': { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Clock },
  'SUCCESS': { label: 'Terkirim (Success)', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  'REJECTED': { label: 'Ditolak Beacukai', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  'RETRY_LATER': { label: 'Tertunda / Retry', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
}

export default function Show({ document }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'response'>('info')
  const config = statusConfig[document.status] || { label: document.status, color: 'bg-slate-100', icon: Info }
  const StatusIcon = config.icon

  const handleSubmit = () => {
    if (confirm('Kirim data ini ke API Beacukai?')) {
      router.post(`/kontainer/${document.id}/submit`)
    }
  }

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('id-ID') : '-'
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Kontainer', href: '/kontainer' },
      { title: document.ref_number, href: `/kontainer/${document.id}` }
    ]}>
      <Head title={`Kontainer ${document.ref_number}`} />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.get('/kontainer')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter uppercase">{document.ref_number}</h1>
                <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none ${config.color}`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-bold tracking-widest mt-1 uppercase">Dibuat: {formatDate(document.created_at)}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {document.status !== 'SUCCESS' && (
              <Button onClick={handleSubmit} className="flex-1 md:flex-none h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
                <Send className="w-4 h-4 mr-2" /> Submit ke Beacukai
              </Button>
            )}
            <Button variant="outline" className="flex-1 md:flex-none h-12 px-8 rounded-xl font-bold uppercase tracking-widest border-slate-200">
              <ExternalLink className="w-4 h-4 mr-2" /> Download XML
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 p-4 border-b">
                <div className="flex p-1 bg-slate-200 rounded-xl w-fit">
                    <button onClick={() => setActiveTab('info')} className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'info' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>General Info</button>
                    <button onClick={() => setActiveTab('response')} className={`px-6 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'response' ? 'bg-white shadow-sm' : 'text-slate-500'}`}>API Response</button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {activeTab === 'info' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Kode Dokumen</Label>
                      <div className="font-black text-slate-900">{document.kd_dok} (COARRI)</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Kode TPS</Label>
                      <div className="font-black text-slate-900">{document.kd_tps}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Kode Gudang</Label>
                      <div className="font-black text-slate-900">{document.kd_gudang}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Tanggal Tiba</Label>
                      <div className="font-black text-slate-900">{formatDate(document.tgl_tiba)}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">No. BC 1.1</Label>
                      <div className="font-black text-slate-900">{document.no_bc11}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Tgl. BC 1.1</Label>
                      <div className="font-black text-slate-900">{formatDate(document.tgl_bc11)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400 font-mono text-xs">
                        <Code className="w-4 h-4" /> Raw JSON Response
                    </div>
                    <pre className="text-slate-300 text-xs font-mono overflow-auto max-h-96">
                      {JSON.stringify(document.response_data, null, 2) || '// No response received yet'}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Container List */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 p-6 border-b">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Unit Kontainer Detail ({document.kontainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b">
                        <th className="text-left p-4 text-[10px] font-black uppercase text-slate-400">No. Kontainer</th>
                        <th className="text-left p-4 text-[10px] font-black uppercase text-slate-400">Ukuran / Jenis</th>
                        <th className="text-left p-4 text-[10px] font-black uppercase text-slate-400">No. Segel</th>
                        <th className="text-left p-4 text-[10px] font-black uppercase text-slate-400">Bruto</th>
                        <th className="text-right p-4 text-[10px] font-black uppercase text-slate-400">Waktu In/Out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {document.kontainers.map((k) => (
                        <tr key={k.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-black text-sm text-slate-900">{k.no_kontainer}</td>
                          <td className="p-4">
                            <div className="text-xs font-bold">{k.ukuran_kontainer} FT</div>
                            <div className="text-[10px] text-slate-400">{k.jns_kontainer === '4' ? 'EMPTY' : (k.jns_kontainer === '7' ? 'LCL' : 'FCL')}</div>
                          </td>
                          <td className="p-4 text-xs font-semibold text-slate-600">{k.no_segel}</td>
                          <td className="p-4 text-xs font-bold text-emerald-600">{k.bruto.toLocaleString()} KG</td>
                          <td className="p-4 text-right text-xs font-mono text-slate-400">
                            {new Date(k.wk_inout).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl bg-indigo-600 text-white p-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Status Integrasi</h3>
                    <div className="text-4xl font-black tracking-tighter">
                        {document.status === 'SUCCESS' ? 'ACCEPTED' : (document.status === 'REJECTED' ? 'REJECTED' : 'PENDING')}
                    </div>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full bg-white transition-all duration-1000 ${document.status === 'SUCCESS' ? 'w-full' : 'w-1/3'}`} />
                    </div>
                    <p className="text-[10px] font-medium opacity-70">
                        Sesuai dengan standarisasi OpenAPI Beacukai, data yang telah terkirim (SUCCESS) tidak dapat diubah kembali.
                    </p>
                </div>
            </Card>

            {document.keterangan && (
              <Card className="border-none shadow-sm rounded-3xl p-6">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Keterangan Internal</Label>
                <p className="text-sm font-medium text-slate-600 italic">"{document.keterangan}"</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
