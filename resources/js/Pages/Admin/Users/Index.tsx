import React, { useState } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Badge } from "@/Components/ui/badge"
import { PageProps } from '@/types'
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
  Users,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Eye
} from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  username?: string
  employee_id?: string
  department?: string
  position?: string
  is_active: boolean
  last_login_at?: string
  roles: Array<{
    id: number
    name: string
    display_name: string
  }>
}

interface Role {
  id: number
  name: string
  display_name: string
}

interface Props extends PageProps {
  users: {
    data: User[]
    links: any[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  roles: Role[]
  filters: {
    search?: string
    role?: string
    status?: string
  }
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Users', href: '/admin/users' }
]

export default function UsersIndex({ users, roles, filters, auth }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [role, setRole] = useState(filters.role || 'all')
  const [status, setStatus] = useState(filters.status || 'all')

  // Check if user has permission to manage users (admin bypass)
  const canManage = auth.user?.roles?.some((r: { name: string }) => r.name === 'admin') || false

  const handleSearch = () => {
    router.get('/admin/users', { 
      search, 
      role: role === 'all' ? '' : role, 
      status: status === 'all' ? '' : status 
    })
  }

  const handleReset = () => {
    setSearch('')
    setRole('all')
    setStatus('all')
    router.get('/admin/users')
  }

  const toggleUserStatus = (user: User) => {
    router.patch(`/admin/users/${user.id}/toggle-status`, {}, {
      onSuccess: () => router.reload({ only: ['users'] })
    })
  }

  const deleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      router.delete(`/admin/users/${user.id}`, {
        onSuccess: () => router.reload({ only: ['users'] })
      })
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="User Management" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage system users and their permissions
            </p>
          </div>
          {canManage && (
            <Button onClick={() => router.get('/admin/users/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({users.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-slate-500">
                          {user.employee_id && `ID: ${user.employee_id}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{user.email}</div>
                        {user.username && (
                          <div className="text-sm text-slate-500">@{user.username}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.department && (
                          <div className="text-sm">{user.department}</div>
                        )}
                        {user.position && (
                          <div className="text-sm text-slate-500">{user.position}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="outline" className="text-xs">
                            {role.display_name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.is_active ? "default" : "secondary"}
                        className={user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManage && (
                          <>
                            <Link href={`/admin/users/${user.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <SquarePen className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {users.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-600">
                  Showing {((users.current_page - 1) * users.per_page) + 1} to{' '}
                  {Math.min(users.current_page * users.per_page, users.total)} of{' '}
                  {users.total} results
                </div>
                <div className="flex gap-2">
                  {users.links.map((link, index) => (
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