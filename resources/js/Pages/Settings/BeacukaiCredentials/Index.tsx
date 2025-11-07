import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import AppLayout from '@/Layouts/app-layout'
import {
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldX,
  Activity,
  Key,
  TestTube,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

interface BeacukaiCredential {
  id: number
  service_name: string
  service_type: string
  username: string
  endpoint_url: string
  description?: string
  is_active: boolean
  is_test_mode: boolean
  usage_count: number
  last_used_at?: string
  created_at: string
  creator?: {
    name: string
  }
}

interface Props {
  credentials: {
    data: BeacukaiCredential[]
    links: any[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  stats: {
    total: number
    active: number
    configured: number
    test_mode: number
  }
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Beacukai Credentials', href: '/beacukai-credentials' }
]

const getStatusBadge = (credential: BeacukaiCredential) => {
  if (!credential.is_active) {
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><ShieldX className="w-3 h-3 mr-1" />Inactive</Badge>
  }
  
  if (credential.is_test_mode) {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><TestTube className="w-3 h-3 mr-1" />Test Mode</Badge>
  }
  
  return <Badge className="bg-green-100 text-green-800"><ShieldCheck className="w-3 h-3 mr-1" />Active</Badge>
}

const getServiceTypeBadge = (type: string) => {
  const colors = {
    SOAP: 'bg-blue-100 text-blue-800',
    REST: 'bg-green-100 text-green-800',
    HTTP: 'bg-purple-100 text-purple-800'
  }
  
  return <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
}

export default function BeacukaiCredentialsIndex({ credentials, stats }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Beacukai Credentials" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Beacukai Credentials
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage authentication credentials for Beacukai services
            </p>
          </div>
          <Link href="/beacukai-credentials/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configured</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.configured}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Mode</CardTitle>
              <TestTube className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.test_mode}</div>
            </CardContent>
          </Card>
        </div>

        {/* Credentials Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Service Credentials ({credentials.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credentials.data.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{credential.service_name.toUpperCase()}</div>
                        <div className="text-sm text-slate-500">
                          {credential.description || 'No description'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getServiceTypeBadge(credential.service_type)}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {credential.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">
                        {credential.endpoint_url}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(credential)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span className="text-sm">{credential.usage_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {credential.last_used_at 
                          ? new Date(credential.last_used_at).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          <Link href={`/beacukai-credentials/${credential.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          
                          <DropdownMenuItem>
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Connection
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem>
                            {credential.is_active ? (
                              <>
                                <ShieldX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {credentials.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">
                  Showing {((credentials.current_page - 1) * credentials.per_page) + 1} to{' '}
                  {Math.min(credentials.current_page * credentials.per_page, credentials.total)} of{' '}
                  {credentials.total} credentials
                </div>
                <div className="flex gap-2">
                  {credentials.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}