import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { router } from '@inertiajs/react'

interface Props {
    kdGudang: {
        kd_gudang: string
        nm_gudang: string
        kd_tps: string
        alamat?: string
        kapasitas?: number
        is_active: boolean
        created_at?: string
        updated_at?: string
    }
}

export default function KdGudangShow({ kdGudang }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Detail Kode Gudang" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => router.get('/reference/kd-gudang')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Detail Kode Gudang</CardTitle>
                                    <CardDescription>Informasi lengkap kode gudang</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500">Kode Gudang</div>
                                    <div className="font-medium">{kdGudang.kd_gudang}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Nama Gudang</div>
                                    <div className="font-medium">{kdGudang.nm_gudang}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Kode TPS</div>
                                    <div className="font-medium">{kdGudang.kd_tps}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Alamat</div>
                                    <div className="font-medium">{kdGudang.alamat || '-'}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Kapasitas</div>
                                    <div className="font-medium">{kdGudang.kapasitas ? `${kdGudang.kapasitas} m³` : '-'}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="font-medium">{kdGudang.is_active ? 'Aktif' : 'Tidak Aktif'}</div>
                                </div>

                                {kdGudang.created_at && (
                                    <div>
                                        <div className="text-sm text-gray-500">Dibuat</div>
                                        <div className="font-medium">{kdGudang.created_at}</div>
                                    </div>
                                )}

                                {kdGudang.updated_at && (
                                    <div>
                                        <div className="text-sm text-gray-500">Terakhir diperbarui</div>
                                        <div className="font-medium">{kdGudang.updated_at}</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
