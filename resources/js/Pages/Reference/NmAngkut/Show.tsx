import { Head, router } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface Props {
    nmAngkut: {
        id: number
        nm_angkut: string
        call_sign: string | null
        jenis_angkutan: string | null
        bendera: string | null
        is_active: boolean
        created_at: string
        updated_at: string
    }
}

export default function NmAngkutShow({ nmAngkut }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Detail: ${nmAngkut.nm_angkut}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => router.get('/reference/nm-angkut')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Detail Nama Angkutan</CardTitle>
                                    <CardDescription>{nmAngkut.nm_angkut}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Nama Angkutan</h3>
                                    <p className="text-lg font-semibold">{nmAngkut.nm_angkut}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Call Sign</h3>
                                    <p>{nmAngkut.call_sign || '-'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Jenis Angkutan</h3>
                                    <p>{nmAngkut.jenis_angkutan || '-'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Bendera</h3>
                                    <p>{nmAngkut.bendera || '-'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                    <p>{nmAngkut.is_active ? 'Aktif' : 'Tidak Aktif'}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Dibuat</h3>
                                    <p>{nmAngkut.created_at}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Terakhir diperbarui</h3>
                                    <p>{nmAngkut.updated_at}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
