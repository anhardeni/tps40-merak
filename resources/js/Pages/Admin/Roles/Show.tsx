import React from 'react'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import AppLayout from '@/Layouts/app-layout'
import { ArrowLeft, Shield, Key, Users, Edit, Trash2 } from "lucide-react"
import { PageProps } from '@/types'

interface Permission {
  id: number
  name: string
  display_name: string
  description?: string
}

interface User {
  id: number
  name: string
  email: string
  username: string
}

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
  is_active: boolean
  permissions: Permission[]
  users: User[]
  created_at: string
  updated_at: string
}

interface Props extends PageProps {
  role: Role
}

export default function ShowRole({ role }: Props) {
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin' },
    { title: 'Roles', href: '/admin/roles' },
    { title: role.display_name, href: `/admin/roles/${role.id}` }
  ]

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      router.delete(route('admin.roles.destroy', role.id))
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Role: ${role.display_name}`} />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {role.display_name}
              </h1>
              <Badge variant={role.is_active ? "default" : "secondary"}>
                {role.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {role.description || 'No description provided'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.get('/admin/roles')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => router.get(route('admin.roles.edit', role.id))}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            {role.name !== 'admin' && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Role Name</p>
                <p className="text-base font-mono text-slate-900 dark:text-slate-50">{role.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Display Name</p>
                <p className="text-base text-slate-900 dark:text-slate-50">{role.display_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                <Badge variant={role.is_active ? "default" : "secondary"}>
                  {role.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Created At</p>
                <p className="text-base text-slate-900 dark:text-slate-50">
                  {new Date(role.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Updated</p>
                <p className="text-base text-slate-900 dark:text-slate-50">
                  {new Date(role.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Permissions</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {role.permissions.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {role.users.length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Assigned Permissions
            </CardTitle>
            <CardDescription>
              {role.permissions.length > 0 
                ? `This role has ${role.permissions.length} permission(s)`
                : 'No permissions assigned to this role'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role.permissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-mono text-sm">
                        {permission.name}
                      </TableCell>
                      <TableCell>{permission.display_name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {permission.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No permissions assigned</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.get(route('admin.roles.edit', role.id))}
                >
                  Assign Permissions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users with This Role
            </CardTitle>
            <CardDescription>
              {role.users.length > 0 
                ? `${role.users.length} user(s) have this role`
                : 'No users assigned to this role'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role.users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {role.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono text-sm">{user.username}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.get(route('admin.users.show', user.id))}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users with this role</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
