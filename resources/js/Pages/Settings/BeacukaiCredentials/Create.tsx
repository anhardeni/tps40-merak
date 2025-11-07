import React, { useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { Checkbox } from "@/Components/ui/checkbox"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import AppLayout from '@/Layouts/app-layout'
import {
  ArrowLeft,
  Save,
  Key,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle
} from "lucide-react"

interface Props {
  serviceOptions: Record<string, string>
  serviceTypeOptions: Record<string, string>
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Settings', href: '/settings' },
  { title: 'Beacukai Credentials', href: '/beacukai-credentials' },
  { title: 'Create', href: '#' }
]

export default function BeacukaiCredentialCreate({ serviceOptions, serviceTypeOptions }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  
  const { data, setData, post, processing, errors, reset } = useForm({
    service_name: '',
    service_type: 'SOAP',
    username: '',
    password: '',
    endpoint_url: '',
    description: '',
    is_active: true,
    is_test_mode: false,
    additional_config: {}
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/beacukai-credentials', {
      onSuccess: () => reset()
    })
  }

  const validateForm = () => {
    const requiredFields = ['service_name', 'service_type', 'username', 'password', 'endpoint_url']
    return requiredFields.every(field => data[field as keyof typeof data])
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Beacukai Credential" />

      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/beacukai-credentials">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Create Beacukai Credential
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Add new authentication credential for Beacukai service
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service_name">Service Name *</Label>
                      <Select 
                        value={data.service_name} 
                        onValueChange={(value) => setData('service_name', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceOptions).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.service_name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="service_type">Service Type *</Label>
                      <Select 
                        value={data.service_type} 
                        onValueChange={(value) => setData('service_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceTypeOptions).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.service_type && (
                        <p className="text-red-500 text-sm mt-1">{errors.service_type}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endpoint_url">Endpoint URL *</Label>
                    <Input
                      id="endpoint_url"
                      type="url"
                      placeholder="https://tpsonline.beacukai.go.id/service.asmx"
                      value={data.endpoint_url}
                      onChange={(e) => setData('endpoint_url', e.target.value)}
                    />
                    {errors.endpoint_url && (
                      <p className="text-red-500 text-sm mt-1">{errors.endpoint_url}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description for this credential"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username from Beacukai"
                      value={data.username}
                      onChange={(e) => setData('username', e.target.value)}
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password from Beacukai"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Password will be encrypted when stored
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                    />
                    <Label htmlFor="is_active" className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Active
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_test_mode"
                      checked={data.is_test_mode}
                      onCheckedChange={(checked) => setData('is_test_mode', checked as boolean)}
                    />
                    <Label htmlFor="is_test_mode" className="flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-yellow-500" />
                      Test Mode
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> All passwords are encrypted using Laravel's 
                  built-in encryption before storing in database. Only authorized users can 
                  access these credentials.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={processing || !validateForm()}
              >
                <Save className="w-4 h-4 mr-2" />
                {processing ? 'Saving...' : 'Save Credential'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}