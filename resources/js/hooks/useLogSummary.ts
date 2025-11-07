import { useState, useEffect } from 'react'
import axios from 'axios'

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

export function useLogSummary() {
  const [logSummary, setLogSummary] = useState<LogSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/logs/summary')
      setLogSummary(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load log summary')
      console.error('Error fetching log summary:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSummary, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return { logSummary, loading, error, refetch: fetchSummary }
}