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
  Download, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Bug,
  Filter,
  FileText,
  Clock
} from "lucide-react"

interface LogEntry {
  timestamp: string
  environment: string
  level: string
  message: string
  context: string
  stack_trace: string
}

interface LogFile {
  name: string
  size: string
  modified: string
}

interface LogIndexProps {
  auth: any
  logFiles: LogFile[]
  selectedLog: string
  logEntries: LogEntry[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  filters: {
    level?: string
    search?: string
  }
}

const levelConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'outline' | 'destructive'; icon: any; color: string }> = {
  debug: { label: 'Debug', variant: 'secondary' as const, icon: Bug, color: 'text-gray-500' },
  info: { label: 'Info', variant: 'default' as const, icon: Info, color: 'text-blue-500' },
  warning: { label: 'Warning', variant: 'outline' as const, icon: AlertTriangle, color: 'text-yellow-500' },
  error: { label: 'Error', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-500' },
  critical: { label: 'Critical', variant: 'destructive' as const, icon: XCircle, color: 'text-red-700' },
  alert: { label: 'Alert', variant: 'destructive' as const, icon: XCircle, color: 'text-red-700' },
  emergency: { label: 'Emergency', variant: 'destructive' as const, icon: XCircle, color: 'text-red-900' },
}

export default function LogIndex({ auth, logFiles, selectedLog, logEntries, pagination, filters }: LogIndexProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [level, setLevel] = useState(filters.level || '')
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null)

  const handleSearch = () => {
    router.get('/logs', {
      file: selectedLog,
      search: search || undefined,
      level: level || undefined,
    }, {
      preserveState: true,
      replace: true
    })
  }

  const handleReset = () => {
    setSearch('')
    setLevel('')
    router.get('/logs', { file: selectedLog }, {
      preserveState: true,
      replace: true
    })
  }

  const handleFileSelect = (filename: string) => {
    router.get('/logs', { file: filename }, {
      preserveState: true,
      replace: true
    })
  }

  const handleClearLog = (filename: string) => {
    if (confirm(`Are you sure you want to clear ${filename}? This action cannot be undone.`)) {
      router.post(`/logs/${filename}/clear`)
    }
  }

  const createTestLogs = () => {
    router.post('/logs/create-test-logs')
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID')
  }

  const truncateMessage = (message: string, length: number = 100) => {
    return message.length > length ? message.substring(0, length) + '...' : message
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'System Logs', href: '/logs' }
    ]}>
      <Head title="System Logs" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              System Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor application logs and debug issues
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={createTestLogs}
            >
              <Bug className="w-4 h-4 mr-2" />
              Create Test Logs
            </Button>
            <Button
              variant="outline"
              onClick={() => router.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Log Files Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Log Files
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {logFiles.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => handleFileSelect(file.name)}
                      className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                        selectedLog === file.name ? 'bg-slate-100 dark:bg-slate-800 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {file.size} • {file.modified}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open(`/logs/${selectedLog}/download`, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Log
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => handleClearLog(selectedLog)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Log
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.get('/logs/soap')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  SOAP Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.get('/logs/errors')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Errors Only
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search in messages..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Log Level</Label>
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="">All Levels</option>
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
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

            {/* Log Entries */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Log Entries ({pagination.total}) - {selectedLog}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No log entries found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logEntries.map((entry, index) => {
                      const config = levelConfig[entry.level] || levelConfig.info
                      const Icon = config.icon

                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant={config.variant} className="text-xs">
                                  {config.label}
                                </Badge>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {formatTimestamp(entry.timestamp)}
                                </div>
                              </div>
                              <div className="font-mono text-sm break-words">
                                {truncateMessage(entry.message)}
                              </div>
                              {entry.context && (
                                <div className="text-xs text-slate-500 mt-1 font-mono">
                                  {truncateMessage(entry.context, 200)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                          {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                          {pagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                          {pagination.current_page > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.get('/logs', {
                                file: selectedLog,
                                page: pagination.current_page - 1,
                                search,
                                level
                              })}
                            >
                              Previous
                            </Button>
                          )}
                          <span className="px-3 py-1 text-sm">
                            Page {pagination.current_page} of {pagination.last_page}
                          </span>
                          {pagination.current_page < pagination.last_page && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.get('/logs', {
                                file: selectedLog,
                                page: pagination.current_page + 1,
                                search,
                                level
                              })}
                            >
                              Next
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Log Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Log Entry Detail</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold">Timestamp</Label>
                    <div className="font-mono text-sm mt-1">{selectedEntry.timestamp}</div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Level</Label>
                    <div className="mt-1">
                      <Badge variant={levelConfig[selectedEntry.level]?.variant || 'default'}>
                        {levelConfig[selectedEntry.level]?.label || selectedEntry.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-semibold">Message</Label>
                    <pre className="font-mono text-sm mt-1 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-3 rounded">
                      {selectedEntry.message}
                    </pre>
                  </div>
                  
                  {selectedEntry.context && (
                    <div>
                      <Label className="font-semibold">Context</Label>
                      <pre className="font-mono text-sm mt-1 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-3 rounded">
                        {selectedEntry.context}
                      </pre>
                    </div>
                  )}
                  
                  {selectedEntry.stack_trace && (
                    <div>
                      <Label className="font-semibold">Stack Trace</Label>
                      <pre className="font-mono text-xs mt-1 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-800 dark:text-red-200">
                        {selectedEntry.stack_trace}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}