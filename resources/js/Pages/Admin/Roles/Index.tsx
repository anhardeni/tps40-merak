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
  Shield,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Eye,
  Users,
  Key
} from 'lucide-react'

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_active: boolean
  users_count: number
  permissions_count: number
}

interface Props {
  roles: {
    data: Role[]
    links: any[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  filters: {
    search?: string
    status?: string
  }
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Roles', href: '/admin/roles' }
]

export default function RolesIndex({ roles, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || 'all')

  const handleSearch = () => {
    const params: any = {};
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status;
    router.get('/admin/roles', params)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    router.get('/admin/roles')
  }

  const toggleRoleStatus = (role: Role) => {
    router.patch(`/admin/roles/${role.id}/toggle-status`, {}, {
      onSuccess: () => router.reload({ only: ['roles'] })
    })
  }

  const deleteRole = (role: Role) => {
    if (confirm(`Are you sure you want to delete the role "${role.display_name}"?`)) {
      router.delete(`/admin/roles/${role.id}`, {
        onSuccess: () => router.reload({ only: ['roles'] })
      })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Role Management" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Role Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage system roles and permissions
            </p>
          </div>
          <Button onClick={() => router.get('/admin/roles/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="flex gap-2">
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

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Roles ({roles.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.data.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{role.display_name}</div>
                        <div className="text-sm text-slate-500">
                          {role.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs">
                        {role.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{role.users_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500" />
                        <span className="text-sm">{role.permissions_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={role.is_active ? "default" : "secondary"}
                        className={role.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/roles/${role.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <SquarePen className="w-4 h-4" />
                          </Button>
                        </Link>
                        {!['super-admin', 'admin'].includes(role.name) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRole(role)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {roles.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">
                  Showing {((roles.current_page - 1) * roles.per_page) + 1} to{' '}
                  {Math.min(roles.current_page * roles.per_page, roles.total)} of{' '}
                  {roles.total} results
                </div>
                <div className="flex gap-2">
                  {roles.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
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