import React from 'react'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import AppLayout from '@/Layouts/app-layout'
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  IdCard, 
  Shield,
  CheckCircle2,
  XCircle,
  Calendar,
  User as UserIcon
} from "lucide-react"
import { PageProps } from '@/types'

interface Permission {
  id: number
  name: string
  display_name: string
}

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  permissions?: Permission[]
}

interface User {
  id: number
  name: string
  email: string
  username?: string
  employee_id?: string
  department?: string
  position?: string
  phone?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  roles: Role[]
}

interface Props extends PageProps {
  user: User
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Detail', href: '#' }
]

export default function ShowUser({ user, auth }: Props) {
  const canEdit = auth.user?.roles?.some((role) => role.name === 'admin') || false

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`User - ${user.name}`} />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              User Details
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View user information and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.get('/admin/users')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {canEdit && (
              <Button onClick={() => router.get(`/admin/users/${user.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {user.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.username && (
                    <div className="flex items-start gap-3">
                      <UserIcon className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Username</p>
                        <p className="font-medium">@{user.username}</p>
                      </div>
                    </div>
                  )}

                  {user.employee_id && (
                    <div className="flex items-start gap-3">
                      <IdCard className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Employee ID</p>
                        <p className="font-medium">{user.employee_id}</p>
                      </div>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.department && (
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Department</p>
                        <p className="font-medium">{user.department}</p>
                      </div>
                    </div>
                  )}

                  {user.position && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Position</p>
                        <p className="font-medium">{user.position}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roles & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Roles & Permissions
                </CardTitle>
                <CardDescription>
                  User roles and their associated permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.roles.length > 0 ? (
                  <div className="space-y-4">
                    {user.roles.map((role) => (
                      <div key={role.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{role.display_name}</h3>
                            {role.description && (
                              <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                            )}
                          </div>
                          <Badge variant="outline">{role.name}</Badge>
                        </div>

                        {role.permissions && role.permissions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Permissions ({role.permissions.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.map((permission) => (
                                <Badge key={permission.id} variant="secondary" className="text-xs">
                                  {permission.display_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">No roles assigned</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Last Login</p>
                    <p className="font-medium text-sm">{formatDate(user.last_login_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Created</p>
                    <p className="font-medium text-sm">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Last Updated</p>
                    <p className="font-medium text-sm">{formatDate(user.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Roles</span>
                  <Badge variant="secondary">{user.roles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total Permissions</span>
                  <Badge variant="secondary">
                    {user.roles.reduce((acc, role) => 
                      acc + (role.permissions?.length || 0), 0
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  {user.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
