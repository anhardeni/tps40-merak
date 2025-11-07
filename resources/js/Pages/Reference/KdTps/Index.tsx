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

interface KdTps {
    kd_tps: string
    nm_tps: string
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    kdTpsList: {
        data: KdTps[]
        links: any
    }
    filters: {
        search: string
    }
}

export default function KdTpsIndex({ kdTpsList, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '')

    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    const handleSearch = () => {
        router.get(
            '/reference/kd-tps',
            { search: search },
            { preserveState: true }
        )
    }

    const deleteKdTps = (kdTps: KdTps) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${kdTps.kd_tps}?`)) {
            router.delete(`/reference/kd-tps/${kdTps.kd_tps}`)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Kode TPS" />

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
                                    Kode TPS
                                </h2>
                                {canManage && (
                                    <Button
                                        onClick={() => router.get('/reference/kd-tps/create')}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kode TPS
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Cari kode atau nama TPS..."
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
                                            <TableHead>Kode TPS</TableHead>
                                            <TableHead>Nama TPS</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kdTpsList.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-center text-gray-500"
                                                >
                                                    Tidak ada data
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            kdTpsList.data.map((kdTps) => (
                                                <TableRow key={kdTps.kd_tps}>
                                                    <TableCell className="font-medium">
                                                        {kdTps.kd_tps}
                                                    </TableCell>
                                                    <TableCell>{kdTps.nm_tps}</TableCell>
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
                                                                            `/reference/kd-tps/${kdTps.kd_tps}`
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
                                                                                    `/reference/kd-tps/${kdTps.kd_tps}/edit`
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="mr-2 h-4 w-4" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                deleteKdTps(kdTps)
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
                            {kdTpsList.links && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {kdTpsList.links.links?.map((link: any, index: number) => (
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
