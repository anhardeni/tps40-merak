import React from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { 
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  Clock,
  FileText,
  ArrowRight
} from "lucide-react"

interface RecentLog {
  level: string
  message: string
  timestamp: string
}

interface LogSummary {
  total_logs: number
  errors_today: number
  warnings_today: number
  recent_logs: RecentLog[]
  soap_calls_today: number
}

interface LogWidgetProps {
  logSummary?: LogSummary
}

const levelConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  debug: { icon: Bug, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
}

export function LogWidget({ logSummary }: LogWidgetProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateMessage = (message: string, length: number = 60) => {
    return message.length > length ? message.substring(0, length) + '...' : message
  }

  // Mock data if no real data provided
  const mockData: LogSummary = {
    total_logs: 0,
    errors_today: 0,
    warnings_today: 0,
    recent_logs: [],
    soap_calls_today: 0
  }

  const data = logSummary || mockData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            System Status
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.get('/logs')}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="text-2xl font-bold text-green-600">{data.total_logs}</div>
            <div className="text-xs text-slate-500">Total Logs</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="text-2xl font-bold text-blue-600">{data.soap_calls_today}</div>
            <div className="text-xs text-slate-500">SOAP Calls</div>
          </div>
        </div>

        {/* Error/Warning Alerts */}
        {(data.errors_today > 0 || data.warnings_today > 0) && (
          <div className="space-y-2">
            {data.errors_today > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {data.errors_today} errors today
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 px-2 text-red-600 hover:text-red-700"
                  onClick={() => router.get('/logs/errors')}
                >
                  View
                </Button>
              </div>
            )}
            
            {data.warnings_today > 0 && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  {data.warnings_today} warnings today
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 px-2 text-yellow-600 hover:text-yellow-700"
                  onClick={() => router.get('/logs?level=warning')}
                >
                  View
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Recent Logs */}
        {data.recent_logs.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Recent Activity
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.recent_logs.slice(0, 3).map((log, index) => {
                const config = levelConfig[log.level] || levelConfig.info
                const Icon = config.icon

                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${config.bgColor}`}
                  >
                    <Icon className={`w-3 h-3 ${config.color}`} />
                    <span className="flex-1 font-mono">
                      {truncateMessage(log.message)}
                    </span>
                    <span className="text-slate-500">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => router.post('/logs/create-test-logs')}
            >
              Generate Test Logs
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => router.get('/logs')}
          >
            <FileText className="w-4 h-4 mr-2" />
            View All Logs
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.get('/logs/soap')}
            >
              SOAP Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.get('/logs/errors')}
            >
              Errors Only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}