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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu'
import { Badge } from '@/Components/ui/badge'
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, ArrowLeft } from 'lucide-react'

interface NmAngkutItem {
    id: number
    nm_angkut: string
    call_sign: string | null
    jenis_angkutan: string | null
    bendera: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    nmAngkut: {
        data: NmAngkutItem[]
        links: any
        meta: any
    }
    filters: {
        search: string
        status: string
    }
}

export default function NmAngkutIndex({ nmAngkut, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '')
    const [status, setStatus] = useState(filters.status || 'all')

    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    const handleSearch = () => {
        router.get(
            '/reference/nm-angkut',
            {
                search: search,
                status: status === 'all' ? '' : status,
            },
            {
                preserveState: true,
            }
        )
    }

    const deleteItem = (item: NmAngkutItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${item.nm_angkut}?`)) {
            router.delete(`/reference/nm-angkut/${item.id}`)
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Nama Angkutan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => router.get('/dashboard')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h2 className="flex-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Nama Angkutan
                                </h2>
                                {canManage && (
                                    <Button onClick={() => router.get('/reference/nm-angkut/create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Nama Angkutan
                                    </Button>
                                )}
                            </div>

                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Cari nama, call sign atau jenis..."
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
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-md border px-3 py-2"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                                <Button onClick={handleSearch}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Call Sign</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Bendera</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {nmAngkut.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-gray-500">
                                                    Tidak ada data
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            nmAngkut.data.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.id}</TableCell>
                                                    <TableCell>{item.nm_angkut}</TableCell>
                                                    <TableCell>{item.call_sign || '-'}</TableCell>
                                                    <TableCell>{item.jenis_angkutan || '-'}</TableCell>
                                                    <TableCell>{item.bendera || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                            {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => router.get(`/reference/nm-angkut/${item.id}`)}>
                                                                    <Eye className="mr-2 h-4 w-4" /> Lihat
                                                                </DropdownMenuItem>
                                                                {canManage && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => router.get(`/reference/nm-angkut/${item.id}/edit`)}>
                                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => deleteItem(item)} className="text-red-600">
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
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

                            {nmAngkut.links && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {nmAngkut.links.links?.map((link: any, index: number) => (
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
