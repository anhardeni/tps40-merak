import { FormEvent } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Checkbox } from '@/Components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface KdDok {
    kd_dok: string
    nm_dok: string
    keterangan: string | null
    is_active: boolean
}

interface Props {
    kdDok: KdDok
}

export default function KdDokEdit({ kdDok }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nm_dok: kdDok.nm_dok || '',
        keterangan: kdDok.keterangan || '',
        is_active: kdDok.is_active ?? true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        put(`/reference/kd-dok/${kdDok.kd_dok}`)
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Kode Dokumen" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/reference/kd-dok')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Edit Kode Dokumen</CardTitle>
                                    <CardDescription>
                                        Edit kode dokumen: {kdDok.kd_dok}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_dok">Kode Dokumen</Label>
                                    <Input
                                        id="kd_dok"
                                        type="text"
                                        value={kdDok.kd_dok}
                                        disabled
                                        className="bg-gray-100 dark:bg-gray-900"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Kode dokumen tidak dapat diubah
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nm_dok">
                                        Nama Dokumen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nm_dok"
                                        type="text"
                                        value={data.nm_dok}
                                        onChange={(e) => setData('nm_dok', e.target.value)}
                                        placeholder="Masukkan nama dokumen"
                                    />
                                    {errors.nm_dok && (
                                        <p className="text-sm text-red-500">{errors.nm_dok}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e) => setData('keterangan', e.target.value)}
                                        placeholder="Masukkan keterangan (opsional)"
                                        rows={4}
                                    />
                                    {errors.keterangan && (
                                        <p className="text-sm text-red-500">{errors.keterangan}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Aktif
                                    </Label>
                                    {errors.is_active && (
                                        <p className="text-sm text-red-500">{errors.is_active}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.get('/reference/kd-dok')}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
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
