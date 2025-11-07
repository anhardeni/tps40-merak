import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import { Badge } from '@/Components/ui/badge'
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react'

interface KdGudang {
    kd_gudang: string
    nm_gudang: string
    kd_tps: string
    alamat: string | null
    kapasitas: number | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface KdTps {
    kd_tps: string
    nm_tps: string
}

interface Props extends PageProps {
    kdGudangs: {
        data: KdGudang[]
        links: any
    }
    kdTpsList: KdTps[]
    filters: {
        search: string
        status: string
        kd_tps: string
    }
}

export default function KdGudangIndex({ kdGudangs, kdTpsList, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '')
    const [status, setStatus] = useState(filters.status || 'all')
    const [kdTps, setKdTps] = useState(filters.kd_tps || 'all')

    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    const handleSearch = () => {
        router.get(
            '/reference/kd-gudang',
            {
                search: search,
                status: status === 'all' ? '' : status,
                kd_tps: kdTps === 'all' ? '' : kdTps,
            },
            {
                preserveState: true,
            }
        )
    }

    const deleteKdGudang = (kdGudang: KdGudang) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${kdGudang.kd_gudang}?`)) {
            router.delete(`/reference/kd-gudang/${kdGudang.kd_gudang}`)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Kode Gudang" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/dashboard')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h2 className="flex-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Kode Gudang
                                </h2>
                                {canManage && (
                                    <Button
                                        onClick={() => router.get('/reference/kd-gudang/create')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kode Gudang
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Cari kode atau nama gudang..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch()
                                                }
                                            }}
                                            className="pl-10"
                                        />
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <Select value={kdTps} onValueChange={setKdTps}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="TPS" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua TPS</SelectItem>
                                        {kdTpsList.map((tps) => (
                                            <SelectItem key={tps.kd_tps} value={tps.kd_tps}>
                                                {tps.kd_tps} - {tps.nm_tps}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleSearch}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                            </div>

                            {/* Table */}
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama Gudang</TableHead>
                                            <TableHead>TPS</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Kapasitas</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kdGudangs.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-gray-500"
                                                >
                                                    Tidak ada data
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            kdGudangs.data.map((kdGudang) => (
                                                <TableRow key={kdGudang.kd_gudang}>
                                                    <TableCell className="font-medium">
                                                        {kdGudang.kd_gudang}
                                                    </TableCell>
                                                    <TableCell>{kdGudang.nm_gudang}</TableCell>
                                                    <TableCell>{kdGudang.kd_tps}</TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {kdGudang.alamat || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {kdGudang.kapasitas ? `${kdGudang.kapasitas} m³` : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                kdGudang.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {kdGudang.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.get(
                                                                            `/reference/kd-gudang/${kdGudang.kd_gudang}`
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Lihat
                                                                </DropdownMenuItem>
                                                                {canManage && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                router.get(
                                                                                    `/reference/kd-gudang/${kdGudang.kd_gudang}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                deleteKdGudang(kdGudang)
                                                                            }
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Hapus
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {kdGudangs.links && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {kdGudangs.links.links?.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url)
                                                }
                                            }}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
