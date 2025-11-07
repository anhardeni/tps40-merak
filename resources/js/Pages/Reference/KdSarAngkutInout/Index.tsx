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

interface KdSarAngkut {
    kd_sar_angkut_inout: string
    nm_sar_angkut_inout: string
    jenis: string
    keterangan: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    kdSarAngkuts: {
        data: KdSarAngkut[]
        links: any
    }
    filters: {
        search: string
        status: string
        jenis: string
    }
}

export default function KdSarAngkutInoutIndex({ kdSarAngkuts, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '')
    const [status, setStatus] = useState(filters.status || 'all')
    const [jenis, setJenis] = useState(filters.jenis || 'all')

    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    const handleSearch = () => {
        router.get(
            '/reference/kd-sar-angkut-inout',
            {
                search: search,
                status: status === 'all' ? '' : status,
                jenis: jenis === 'all' ? '' : jenis,
            },
            {
                preserveState: true,
            }
        )
    }

    const deleteKdSarAngkut = (kdSarAngkut: KdSarAngkut) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${kdSarAngkut.kd_sar_angkut_inout}?`)) {
            router.delete(`/reference/kd-sar-angkut-inout/${kdSarAngkut.kd_sar_angkut_inout}`)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Kode Sarana Angkut In/Out" />

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
                                    Kode Sarana Angkut In/Out
                                </h2>
                                {canManage && (
                                    <Button
                                        onClick={() => router.get('/reference/kd-sar-angkut-inout/create')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kode Sarana Angkut
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Cari kode atau nama sarana angkut..."
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
                                <Select value={jenis} onValueChange={setJenis}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis</SelectItem>
                                        <SelectItem value="IN">IN</SelectItem>
                                        <SelectItem value="OUT">OUT</SelectItem>
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
                                            <TableHead>Nama Sarana Angkut</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kdSarAngkuts.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center text-gray-500"
                                                >
                                                    Tidak ada data
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            kdSarAngkuts.data.map((kdSarAngkut) => (
                                                <TableRow key={kdSarAngkut.kd_sar_angkut_inout}>
                                                    <TableCell className="font-medium">
                                                        {kdSarAngkut.kd_sar_angkut_inout}
                                                    </TableCell>
                                                    <TableCell>{kdSarAngkut.nm_sar_angkut_inout}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={kdSarAngkut.jenis === 'IN' ? 'default' : 'outline'}>
                                                            {kdSarAngkut.jenis}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {kdSarAngkut.keterangan || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                kdSarAngkut.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {kdSarAngkut.is_active ? 'Aktif' : 'Tidak Aktif'}
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
                                                                            `/reference/kd-sar-angkut-inout/${kdSarAngkut.kd_sar_angkut_inout}`
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
                                                                                    `/reference/kd-sar-angkut-inout/${kdSarAngkut.kd_sar_angkut_inout}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                deleteKdSarAngkut(kdSarAngkut)
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
                            {kdSarAngkuts.links && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {kdSarAngkuts.links.links?.map((link: any, index: number) => (
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
