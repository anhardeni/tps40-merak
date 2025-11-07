import React, { FormEventHandler, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import AppLayout from '@/Layouts/app-layout'
import { ArrowLeft, UserPlus, AlertCircle } from "lucide-react"
import { PageProps } from '@/types'

interface Role {
  id: number
  name: string
  display_name: string
  description?: string
}

interface Props extends PageProps {
  roles: Role[]
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Create', href: '/admin/users/create' }
]

export default function CreateUser({ roles }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    username: '',
    employee_id: '',
    password: '',
    password_confirmation: '',
    department: '',
    position: '',
    phone: '',
    roles: [] as number[],
    is_active: true,
  })

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('admin.users.store'))
  }

  const toggleRole = (roleId: number) => {
    const currentRoles = [...data.roles]
    const index = currentRoles.indexOf(roleId)
    
    if (index > -1) {
      currentRoles.splice(index, 1)
    } else {
      currentRoles.push(roleId)
    }
    
    setData('roles', currentRoles)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create User" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Create New User
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Add a new user to the system
            </p>
          </div>
          <Button variant="outline" onClick={() => router.get('/admin/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the user's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={data.username}
                      onChange={(e) => setData('username', e.target.value)}
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={data.employee_id}
                      onChange={(e) => setData('employee_id', e.target.value)}
                      className={errors.employee_id ? 'border-red-500' : ''}
                    />
                    {errors.employee_id && (
                      <p className="text-sm text-red-500">{errors.employee_id}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Set a secure password for the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={errors.password_confirmation ? 'border-red-500' : ''}
                    />
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional details about the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={data.department}
                      onChange={(e) => setData('department', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={data.position}
                      onChange={(e) => setData('position', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Roles <span className="text-red-500">*</span>
                </CardTitle>
                <CardDescription>
                  Assign roles to define user permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.roles && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.roles}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={data.roles.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {role.display_name}
                        </label>
                        {role.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Set the initial status for this account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked === true)}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Active Account
                    </label>
                    <p className="text-sm text-slate-500">
                      User can login and access the system
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.get('/admin/users')}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                <UserPlus className="w-4 h-4 mr-2" />
                {processing ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
