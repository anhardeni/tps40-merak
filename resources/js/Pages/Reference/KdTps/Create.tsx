import { FormEvent } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function KdTpsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kd_tps: '',
        nm_tps: '',
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post('/reference/kd-tps')
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Kode TPS" />

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
                                    <CardTitle>Tambah Kode TPS</CardTitle>
                                    <CardDescription>
                                        Tambahkan kode TPS baru ke dalam sistem
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_tps">
                                        Kode TPS <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="kd_tps"
                                        type="text"
                                        value={data.kd_tps}
                                        onChange={(e) => setData('kd_tps', e.target.value)}
                                        placeholder="Masukkan kode TPS"
                                        maxLength={10}
                                    />
                                    {errors.kd_tps && (
                                        <p className="text-sm text-red-500">{errors.kd_tps}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nm_tps">
                                        Nama TPS <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nm_tps"
                                        type="text"
                                        value={data.nm_tps}
                                        onChange={(e) => setData('nm_tps', e.target.value)}
                                        placeholder="Masukkan nama TPS"
                                    />
                                    {errors.nm_tps && (
                                        <p className="text-sm text-red-500">{errors.nm_tps}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.get('/reference/kd-tps')}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
