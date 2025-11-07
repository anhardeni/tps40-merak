import React, { FormEventHandler } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import { Textarea } from "@/Components/ui/textarea"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import AppLayout from '@/Layouts/app-layout'
import { ArrowLeft, Key, AlertCircle } from "lucide-react"

interface Props {
  credential: {
    id: number
    service_name: string
    service_type: string
    username: string | null
    endpoint_url: string | null
    is_active: boolean
    is_test_mode: boolean
    description: string | null
  }
}

export default function Edit({ credential }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    service_name: credential.service_name || '',
    service_type: credential.service_type || 'SOAP',
    username: credential.username || '',
    password: '', // Leave empty, only update if filled
    endpoint_url: credential.endpoint_url || '',
    is_active: credential.is_active,
    is_test_mode: credential.is_test_mode,
    description: credential.description || '',
  })

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    put(`/admin/beacukai-credentials/${credential.id}`)
  }

  return (
    <AppLayout>
      <Head title="Edit Beacukai Credential" />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Key className="h-8 w-8" />
              Edit Beacukai Credential
            </h1>
            <p className="text-muted-foreground mt-1">
              Update credential: {credential.service_name}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.get('/admin/beacukai-credentials')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credential Information</CardTitle>
            <CardDescription>Update the details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Name */}
                <div className="space-y-2">
                  <Label htmlFor="service_name">
                    Service Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="service_name"
                    value={data.service_name}
                    onChange={(e) => setData('service_name', e.target.value)}
                    placeholder="cocotangki, sppb, etc"
                    className={errors.service_name ? 'border-red-500' : ''}
                  />
                  {errors.service_name && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.service_name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="service_type">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOAP">SOAP</SelectItem>
                      <SelectItem value="REST">REST</SelectItem>
                      <SelectItem value="GraphQL">GraphQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Endpoint URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endpoint_url">Endpoint URL</Label>
                  <Input
                    id="endpoint_url"
                    type="url"
                    value={data.endpoint_url}
                    onChange={(e) => setData('endpoint_url', e.target.value)}
                    placeholder="https://tpsonline.beacukai.go.id/tps/service.asmx"
                    className={errors.endpoint_url ? 'border-red-500' : ''}
                  />
                  {errors.endpoint_url && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.endpoint_url}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Leave empty to keep current"
                  />
                  <p className="text-sm text-muted-foreground">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_test_mode"
                      checked={data.is_test_mode}
                      onCheckedChange={(checked) => setData('is_test_mode', checked as boolean)}
                    />
                    <Label htmlFor="is_test_mode" className="cursor-pointer">
                      Test/Sandbox Mode
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.get('/admin/beacukai-credentials')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Credential'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
