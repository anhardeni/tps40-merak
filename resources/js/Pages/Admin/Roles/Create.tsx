import React, { FormEventHandler } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import { Textarea } from "@/Components/ui/textarea"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import AppLayout from '@/Layouts/app-layout'
import { ArrowLeft, Shield, AlertCircle } from "lucide-react"
import { PageProps } from '@/types'

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Roles', href: '/admin/roles' },
  { title: 'Create', href: '/admin/roles/create' }
]

export default function CreateRole({ }: PageProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
  })

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    post(route('admin.roles.store'))
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Role" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Create New Role
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Add a new role to the system
            </p>
          </div>
          <Button variant="outline" onClick={() => router.get('/admin/roles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role Information
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., super_admin, content_manager"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.name}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Use lowercase letters and underscores only (e.g., super_admin)
                </p>
              </div>

              {/* Display Name Field */}
              <div className="space-y-2">
                <Label htmlFor="display_name">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  value={data.display_name}
                  onChange={(e) => setData('display_name', e.target.value)}
                  placeholder="e.g., Super Administrator"
                  className={errors.display_name ? 'border-red-500' : ''}
                />
                {errors.display_name && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.display_name}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  User-friendly name shown in the interface
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Describe the purpose and responsibilities of this role..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.description}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active Role
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.get('/admin/roles')}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Next Steps
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  After creating the role, you can assign permissions to it from the roles list.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
