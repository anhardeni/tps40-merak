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

interface KdDok {
    kd_dok: string
    nm_dok: string
    keterangan: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    kdDoks: {
        data: KdDok[]
        links: any
    }
    filters: {
        search: string
        status: string
    }
}

export default function KdDokIndex({ kdDoks, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '')
    const [status, setStatus] = useState(filters.status || 'all')

    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    const handleSearch = () => {
        router.get(
            '/reference/kd-dok',
            {
                search: search,
                status: status === 'all' ? '' : status,
            },
            {
                preserveState: true,
            }
        )
    }

    const deleteKdDok = (kdDok: KdDok) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${kdDok.kd_dok}?`)) {
            router.delete(`/reference/kd-dok/${kdDok.kd_dok}`)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Kode Dokumen" />

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
                                    Kode Dokumen
                                </h2>
                                {canManage && (
                                    <Button
                                        onClick={() => router.get('/reference/kd-dok/create')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kode Dokumen
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Cari kode atau nama dokumen..."
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
                                            <TableHead>Nama Dokumen</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kdDoks.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center text-gray-500"
                                                >
                                                    Tidak ada data
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            kdDoks.data.map((kdDok) => (
                                                <TableRow key={kdDok.kd_dok}>
                                                    <TableCell className="font-medium">
                                                        {kdDok.kd_dok}
                                                    </TableCell>
                                                    <TableCell>{kdDok.nm_dok}</TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {kdDok.keterangan || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                kdDok.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {kdDok.is_active ? 'Aktif' : 'Tidak Aktif'}
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
                                                                            `/reference/kd-dok/${kdDok.kd_dok}`
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
                                                                                    `/reference/kd-dok/${kdDok.kd_dok}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                deleteKdDok(kdDok)
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
                            {kdDoks.links && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {kdDoks.links.links?.map((link: any, index: number) => (
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
