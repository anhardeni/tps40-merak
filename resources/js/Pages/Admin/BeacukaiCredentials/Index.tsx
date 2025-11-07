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
import AppLayout from '@/Layouts/app-layout'
import {
  Key,
  Plus,
  Search,
  SquarePen,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface BeacukaiCredential {
  id: number
  service_name: string
  service_type: string
  endpoint_url: string | null
  is_active: boolean
  is_test_mode: boolean
  description: string | null
  usage_count: number
  last_used_at: string | null
  last_tested_at: string | null
  created_at: string
  updated_at: string
}

interface Props {
  credentials: {
    data: BeacukaiCredential[]
    links: any
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters: {
    search?: string
    status?: string
    environment?: string
  }
}

export default function Index({ credentials, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || 'all')
  const [environment, setEnvironment] = useState(filters.environment || 'all')
  const [testingId, setTestingId] = useState<number | null>(null)

  const handleSearch = () => {
    router.get('/admin/beacukai-credentials', {
      search,
      status: status === 'all' ? undefined : status,
      environment: environment === 'all' ? undefined : environment,
    }, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleTestConnection = async (credential: BeacukaiCredential) => {
    if (!confirm(`Test connection untuk ${credential.service_name}?`)) return

    setTestingId(credential.id)

    try {
      const response = await fetch(`/admin/beacukai-credentials/${credential.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ Connection berhasil!\n\n' + JSON.stringify(result.data, null, 2))
        router.reload({ only: ['credentials'] })
      } else {
        alert('❌ Connection gagal!\n\n' + result.message)
      }
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setTestingId(null)
    }
  }

  const deleteCredential = (credential: BeacukaiCredential) => {
    if (!confirm(`Hapus credential ${credential.service_name}?`)) return

    router.delete(`/admin/beacukai-credentials/${credential.id}`, {
      preserveScroll: true,
    })
  }

  return (
    <AppLayout>
      <Head title="Beacukai Credentials" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8" />
              Beacukai Credentials
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage SOAP/API credentials untuk integrasi Bea Cukai
            </p>
          </div>
          <Link href="/admin/beacukai-credentials/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Credential
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="search"
                    placeholder="Cari service name, URL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environment</SelectItem>
                  <SelectItem value="test">Test/Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Endpoint URL</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Tested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada credential. Tambahkan credential pertama Anda.
                    </TableCell>
                  </TableRow>
                ) : (
                  credentials.data.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{credential.service_name}</div>
                          {credential.description && (
                            <div className="text-sm text-muted-foreground">
                              {credential.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{credential.service_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">
                          {credential.endpoint_url || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={credential.is_test_mode ? "secondary" : "default"}>
                          {credential.is_test_mode ? 'Test/Sandbox' : 'Production'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={credential.is_active ? "success" : "destructive"}>
                          {credential.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {credential.last_tested_at ? (
                          <div className="text-sm">
                            {new Date(credential.last_tested_at).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestConnection(credential)}
                            disabled={testingId === credential.id}
                            title="Test Connection"
                          >
                            {testingId === credential.id ? (
                              <div className="animate-spin">⏳</div>
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                          </Button>
                          <Link href={`/admin/beacukai-credentials/${credential.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <SquarePen className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCredential(credential)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {credentials.total > credentials.per_page && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((credentials.current_page - 1) * credentials.per_page) + 1} to {Math.min(credentials.current_page * credentials.per_page, credentials.total)} of {credentials.total} results
            </div>
            <div className="flex gap-2">
              {credentials.links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => link.url && router.get(link.url)}
                  disabled={!link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
