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
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Bug
} from "lucide-react"

interface ErrorLogEntry {
  timestamp: string
  environment: string
  level: string
  message: string
  context: string
  stack_trace: string
}

interface ErrorsProps {
  auth: any
  errorLogs: ErrorLogEntry[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  filters: {
    search?: string
  }
}

const levelConfig: Record<string, { label: string; variant: 'destructive' | 'outline'; icon: any; color: string }> = {
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle, color: 'text-red-500' },
  critical: { label: 'Critical', variant: 'destructive', icon: XCircle, color: 'text-red-700' },
  alert: { label: 'Alert', variant: 'destructive', icon: XCircle, color: 'text-red-700' },
  emergency: { label: 'Emergency', variant: 'destructive', icon: XCircle, color: 'text-red-900' },
}

export default function Errors({ auth, errorLogs, pagination, filters }: ErrorsProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null)

  const handleSearch = () => {
    router.get('/logs/errors', {
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true
    })
  }

  const handleReset = () => {
    setSearch('')
    router.get('/logs/errors', {}, {
      preserveState: true,
      replace: true
    })
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID')
  }

  const truncateMessage = (message: string, length: number = 120) => {
    return message.length > length ? message.substring(0, length) + '...' : message
  }

  const extractErrorType = (message: string) => {
    const match = message.match(/(\w+Exception|\w+Error)/)
    return match ? match[1] : 'Error'
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'System Logs', href: '/logs' },
      { title: 'Errors', href: '/logs/errors' }
    ]}>
      <Head title="Error Logs" />

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
                Error Logs
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Critical errors and exceptions in the application
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.reload()}
          >
            <Bug className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Search in error messages and stack traces</Label>
                <Input
                  id="search"
                  placeholder="Exception type, file name, method..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div className="flex items-end gap-2 md:col-span-2">
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

        {/* Error Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{pagination.total}</div>
              <p className="text-xs text-slate-500 mt-1">
                Errors found in logs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <XCircle className="h-4 w-4 text-red-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {errorLogs.filter(log => ['critical', 'alert', 'emergency'].includes(log.level)).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {errorLogs.filter(log => {
                  const logTime = new Date(log.timestamp)
                  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
                  return logTime > hourAgo
                }).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                In the last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Types</CardTitle>
              <Bug className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(errorLogs.map(log => extractErrorType(log.message))).size}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Unique error types
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error List */}
        <Card>
          <CardHeader>
            <CardTitle>Error Entries ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {errorLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No errors found</p>
                <p className="text-sm mt-2">That's good news! Your application is running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {errorLogs.map((error, index) => {
                  const config = levelConfig[error.level] || levelConfig.error
                  const Icon = config.icon
                  const errorType = extractErrorType(error.message)

                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer border-red-200 dark:border-red-800"
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={config.variant} className="text-xs">
                                {config.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {errorType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(error.timestamp)}
                            </div>
                          </div>
                          
                          <div className="font-mono text-sm text-red-800 dark:text-red-200 mb-2">
                            {truncateMessage(error.message)}
                          </div>
                          
                          {error.context && (
                            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">
                              {truncateMessage(error.context, 200)}
                            </div>
                          )}
                          
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
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
                      {pagination.total} errors
                    </div>
                    <div className="flex items-center gap-2">
                      {pagination.current_page > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.get('/logs/errors', {
                            page: pagination.current_page - 1,
                            search
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
                          onClick={() => router.get('/logs/errors', {
                            page: pagination.current_page + 1,
                            search
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

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                      Error Details
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="destructive">{selectedError.level}</Badge>
                      <Badge variant="outline">{extractErrorType(selectedError.message)}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedError(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                <div>
                  <Label className="font-semibold text-red-700 dark:text-red-300">Timestamp</Label>
                  <div className="font-mono text-sm mt-1">{selectedError.timestamp}</div>
                </div>
                
                <div>
                  <Label className="font-semibold text-red-700 dark:text-red-300">Error Message</Label>
                  <pre className="font-mono text-sm mt-2 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                    {selectedError.message}
                  </pre>
                </div>
                
                {selectedError.context && (
                  <div>
                    <Label className="font-semibold text-red-700 dark:text-red-300">Context</Label>
                    <pre className="font-mono text-sm mt-2 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded">
                      {selectedError.context}
                    </pre>
                  </div>
                )}
                
                {selectedError.stack_trace && (
                  <div>
                    <Label className="font-semibold text-red-700 dark:text-red-300">Stack Trace</Label>
                    <pre className="font-mono text-xs mt-2 whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 overflow-x-auto">
                      {selectedError.stack_trace}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}