import { FormEvent, useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Checkbox } from '@/Components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function KdDokCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kd_dok: '',
        nm_dok: '',
        keterangan: '',
        is_active: true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post('/reference/kd-dok')
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Kode Dokumen" />

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
                                    <CardTitle>Tambah Kode Dokumen</CardTitle>
                                    <CardDescription>
                                        Tambahkan kode dokumen baru ke dalam sistem
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_dok">
                                        Kode Dokumen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="kd_dok"
                                        type="text"
                                        value={data.kd_dok}
                                        onChange={(e) => setData('kd_dok', e.target.value)}
                                        placeholder="Masukkan kode dokumen"
                                        maxLength={10}
                                    />
                                    {errors.kd_dok && (
                                        <p className="text-sm text-red-500">{errors.kd_dok}</p>
                                    )}
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
