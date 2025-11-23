import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { router } from '@inertiajs/react'

interface Props {
    kdTps: {
        kd_tps: string
        nm_tps: string
        created_at?: string
        updated_at?: string
    }
}

export default function KdTpsShow({ kdTps }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Detail Kode TPS" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/reference/kd-tps')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Detail Kode TPS</CardTitle>
                                    <CardDescription>Informasi lengkap kode TPS</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-500">Kode TPS</div>
                                    <div className="font-medium">{kdTps.kd_tps}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Nama TPS</div>
                                    <div className="font-medium">{kdTps.nm_tps}</div>
                                </div>

                                {kdTps.created_at && (
                                    <div>
                                        <div className="text-sm text-gray-500">Dibuat</div>
                                        <div className="font-medium">{kdTps.created_at}</div>
                                    </div>
                                )}

                                {kdTps.updated_at && (
                                    <div>
                                        <div className="text-sm text-gray-500">Terakhir diperbarui</div>
                                        <div className="font-medium">{kdTps.updated_at}</div>
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
