import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
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
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  ShieldAlert,
  Terminal,
  Warehouse
} from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  username?: string
  roles: Array<{ name: string; display_name: string }>
}

interface Assignment {
  id: number
  user_id: number
  user_name: string
  kd_tps: string
  nm_tps: string
  kd_gudang: string
  nm_gudang: string
}

interface KdTps {
  kd_tps: string
  nm_tps: string
}

interface KdGudang {
  kd_gudang: string
  nm_gudang: string
  kd_tps: string
}

interface Props extends PageProps {
  users: {
    data: User[]
    links: any[]
    total: number
  }
  assignments: Assignment[]
  kdTps: KdTps[]
  kdGudang: KdGudang[]
  filters: {
    search?: string
  }
}

const breadcrumbs = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Admin', href: '/admin' },
  { title: 'Location Permissions', href: '/admin/user-location-access' }
]

export default function UserLocationAccessIndex({ users, assignments, kdTps, kdGudang, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  
  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '',
    kd_tps: '',
    kd_gudang: '',
  })

  const handleSearch = () => {
    router.get('/admin/user-location-access', { search }, { preserveState: true })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/admin/user-location-access', {
      onSuccess: () => reset(),
    })
  }

  const removeAssignment = (id: number) => {
    if (confirm('Are you sure you want to remove this location access?')) {
      router.delete(`/admin/user-location-access/${id}`)
    }
  }

  // Filter warehouses based on selected TPS
  const filteredWarehouses = kdGudang.filter(g => g.kd_tps === data.kd_tps)

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Location Permissions" />

      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-indigo-600" />
            User Location Permissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage physical location restrictions (TPS and Gudang) for each user.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Assignment Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-t-4 border-t-indigo-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Assign New Location
                </CardTitle>
                <CardDescription>
                  Link a user to a specific terminal and warehouse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select User</label>
                    <Select value={data.user_id} onValueChange={(val) => setData('user_id', val)}>
                      <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.data.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name} (@{u.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.user_id && <p className="text-xs text-red-500">{errors.user_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">TPS (Terminal)</label>
                    <Select value={data.kd_tps} onValueChange={(val) => {
                        setData('kd_tps', val);
                        setData('kd_gudang', ''); // Reset warehouse on TPS change
                    }}>
                      <SelectTrigger className={errors.kd_tps ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select TPS..." />
                      </SelectTrigger>
                      <SelectContent>
                        {kdTps.map((t) => (
                          <SelectItem key={t.kd_tps} value={t.kd_tps}>
                            {t.kd_tps} - {t.nm_tps}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.kd_tps && <p className="text-xs text-red-500">{errors.kd_tps}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gudang (Warehouse)</label>
                    <Select 
                      value={data.kd_gudang} 
                      onValueChange={(val) => setData('kd_gudang', val)}
                      disabled={!data.kd_tps}
                    >
                      <SelectTrigger className={errors.kd_gudang ? 'border-red-500' : ''}>
                        <SelectValue placeholder={data.kd_tps ? "Select Gudang..." : "Select TPS first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredWarehouses.map((g) => (
                          <SelectItem key={g.kd_gudang} value={g.kd_gudang}>
                            {g.kd_gudang} - {g.nm_gudang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.kd_gudang && <p className="text-xs text-red-500">{errors.kd_gudang}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={processing}>
                    <Plus className="w-4 h-4 mr-2" />
                    Grant Access
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <CardContent className="p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-400">
                  <p className="font-bold mb-1">Admin Bypass Note:</p>
                  Users with the <strong>'admin'</strong> role automatically have access to all locations. You don't need to assign them here unless you want to track their primary station.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: List of Assignments */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Existing Permissions</CardTitle>
                  <CardDescription>All active location restrictions.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                   <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search user..."
                      className="pl-8 w-[200px]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                      <TableHead><Users className="w-4 h-4 inline mr-2" />User</TableHead>
                      <TableHead><Terminal className="w-4 h-4 inline mr-2" />TPS</TableHead>
                      <TableHead><Warehouse className="w-4 h-4 inline mr-2" />Gudang</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                          No location permissions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((row) => (
                        <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <TableCell>
                            <div className="font-medium">{row.user_name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {row.kd_tps}
                            </Badge>
                            <span className="ml-2 text-xs text-slate-500 hidden md:inline">
                              {row.nm_tps}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {row.kd_gudang}
                            </Badge>
                            <span className="ml-2 text-xs text-slate-500 hidden md:inline">
                              {row.nm_gudang}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeAssignment(row.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
