import { Head, router } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { PageProps } from '@/types'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { ArrowLeft, Edit } from 'lucide-react'

interface KdDok {
    kd_dok: string
    nm_dok: string
    keterangan: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    kdDok: KdDok
}

export default function KdDokShow({ kdDok, auth }: Props) {
    const canManage = auth.user?.roles?.some((r: any) => r.name === 'admin') || false

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Kode Dokumen - ${kdDok.kd_dok}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => router.get('/reference/kd-dok')}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <div>
                                        <CardTitle>Detail Kode Dokumen</CardTitle>
                                        <CardDescription>
                                            Informasi lengkap kode dokumen
                                        </CardDescription>
                                    </div>
                                </div>
                                {canManage && (
                                    <Button
                                        onClick={() =>
                                            router.get(`/reference/kd-dok/${kdDok.kd_dok}/edit`)
                                        }
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Kode Dokumen
                                    </div>
                                    <div className="col-span-2 font-semibold">
                                        {kdDok.kd_dok}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Nama Dokumen
                                    </div>
                                    <div className="col-span-2">{kdDok.nm_dok}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Keterangan
                                    </div>
                                    <div className="col-span-2">
                                        {kdDok.keterangan || (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Status
                                    </div>
                                    <div className="col-span-2">
                                        <Badge
                                            variant={kdDok.is_active ? 'default' : 'secondary'}
                                        >
                                            {kdDok.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Dibuat
                                    </div>
                                    <div className="col-span-2 text-sm">{kdDok.created_at}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-medium text-gray-500 dark:text-gray-400">
                                        Terakhir Diperbarui
                                    </div>
                                    <div className="col-span-2 text-sm">{kdDok.updated_at}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
