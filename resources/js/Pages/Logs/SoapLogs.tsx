import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { 
  Search, 
  Filter, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Globe,
  Timer,
  Eye,
  Download
} from "lucide-react"

interface SoapLog {
  id: number
  method: string
  endpoint: string
  request_data: string
  response_data: string
  status: 'success' | 'error'
  response_time: number
  created_at: string
}

interface SoapLogsProps {
  auth: any
  soapLogs: {
    data: SoapLog[]
    links: any[]
    meta: any
  }
  filters: {
    status?: string
    date_from?: string
    date_to?: string
    search?: string
  }
}

export default function SoapLogs({ auth, soapLogs, filters }: SoapLogsProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')
  const [dateFrom, setDateFrom] = useState(filters.date_from || '')
  const [dateTo, setDateTo] = useState(filters.date_to || '')
  const [selectedLog, setSelectedLog] = useState<SoapLog | null>(null)

  const handleSearch = () => {
    router.get('/logs/soap', {
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
    router.get('/logs/soap', {}, {
      preserveState: true,
      replace: true
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  const formatResponseTime = (time: number) => {
    if (time < 1000) {
      return `${time.toFixed(1)}ms`
    }
    return `${(time / 1000).toFixed(2)}s`
  }

  const formatJson = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2)
    } catch {
      return jsonString
    }
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'System Logs', href: '/logs' },
      { title: 'SOAP Logs', href: '/logs/soap' }
    ]}>
      <Head title="SOAP Logs" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.get('/logs')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Logs
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                SOAP Logs
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor SOAP API calls and responses
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.reload()}
          >
            <Timer className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Method, endpoint..."
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
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOAP Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>SOAP API Calls ({soapLogs.meta.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {soapLogs.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No SOAP logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Timestamp</th>
                          <th className="text-left p-4 font-medium">Method</th>
                          <th className="text-left p-4 font-medium">Endpoint</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Response Time</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soapLogs.data.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-slate-400" />
                                {formatDateTime(log.created_at)}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{log.method}</Badge>
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="truncate text-sm font-mono">
                                {log.endpoint}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge 
                                variant={log.status === 'success' ? 'success' : 'destructive'}
                                className="flex items-center gap-1 w-fit"
                              >
                                {log.status === 'success' ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                {log.status}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className={`text-sm ${
                                log.response_time > 2000 ? 'text-red-600' :
                                log.response_time > 1000 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {formatResponseTime(log.response_time)}
                              </span>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {soapLogs.data.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">{log.method}</Badge>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(log.created_at)}
                          </div>
                        </div>
                        <Badge 
                          variant={log.status === 'success' ? 'success' : 'destructive'}
                          className="flex items-center gap-1"
                        >
                          {log.status === 'success' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {log.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm mb-3 font-mono truncate">
                        {log.endpoint}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className={`text-sm ${
                          log.response_time > 2000 ? 'text-red-600' :
                          log.response_time > 1000 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {formatResponseTime(log.response_time)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {soapLogs.links && soapLogs.links.length > 3 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Showing {soapLogs.meta.from} - {soapLogs.meta.to} of {soapLogs.meta.total} logs
                    </div>
                    <div className="flex items-center gap-2">
                      {soapLogs.links.map((link: any, index: number) => (
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

        {/* SOAP Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">SOAP Call Details</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selectedLog.method}</Badge>
                      <Badge variant={selectedLog.status === 'success' ? 'success' : 'destructive'}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-semibold">Request Data</Label>
                    <pre className="font-mono text-xs mt-2 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded overflow-x-auto">
                      {formatJson(selectedLog.request_data)}
                    </pre>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Response Data</Label>
                    <pre className="font-mono text-xs mt-2 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded overflow-x-auto">
                      {formatJson(selectedLog.response_data)}
                    </pre>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <Label className="font-semibold">Endpoint</Label>
                    <div className="font-mono text-sm mt-1 break-all">{selectedLog.endpoint}</div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Response Time</Label>
                    <div className="text-sm mt-1">{formatResponseTime(selectedLog.response_time)}</div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Timestamp</Label>
                    <div className="text-sm mt-1">{formatDateTime(selectedLog.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}