import { FormEvent } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Checkbox } from '@/Components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

interface KdDokInout {
    kd_dok_inout: string
    nm_dok_inout: string
    jenis: string
    keterangan: string | null
    is_active: boolean
}

interface Props {
    kdDokInout: KdDokInout
}

export default function KdDokInoutEdit({ kdDokInout }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nm_dok_inout: kdDokInout.nm_dok_inout || '',
        jenis: kdDokInout.jenis || 'IN',
        keterangan: kdDokInout.keterangan || '',
        is_active: kdDokInout.is_active ?? true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        put(`/reference/kd-dok-inout/${kdDokInout.kd_dok_inout}`)
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Kode Dokumen In/Out" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/reference/kd-dok-inout')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Edit Kode Dokumen In/Out</CardTitle>
                                    <CardDescription>
                                        Edit kode dokumen in/out: {kdDokInout.kd_dok_inout}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_dok_inout">Kode Dokumen In/Out</Label>
                                    <Input
                                        id="kd_dok_inout"
                                        type="text"
                                        value={kdDokInout.kd_dok_inout}
                                        disabled
                                        className="bg-gray-100 dark:bg-gray-900"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Kode dokumen tidak dapat diubah
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nm_dok_inout">
                                        Nama Dokumen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nm_dok_inout"
                                        type="text"
                                        value={data.nm_dok_inout}
                                        onChange={(e) => setData('nm_dok_inout', e.target.value)}
                                        placeholder="Masukkan nama dokumen"
                                    />
                                    {errors.nm_dok_inout && (
                                        <p className="text-sm text-red-500">{errors.nm_dok_inout}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis">
                                        Jenis <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.jenis} onValueChange={(value) => setData('jenis', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IN">IN (Masuk)</SelectItem>
                                            <SelectItem value="OUT">OUT (Keluar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.jenis && (
                                        <p className="text-sm text-red-500">{errors.jenis}</p>
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
                                        onClick={() => router.get('/reference/kd-dok-inout')}
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
