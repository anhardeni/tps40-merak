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

export default function KdSarAngkutInoutCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kd_sar_angkut_inout: '',
        nm_sar_angkut_inout: '',
        jenis: 'IN',
        keterangan: '',
        is_active: true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post('/reference/kd-sar-angkut-inout')
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Kode Sarana Angkut" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/reference/kd-sar-angkut-inout')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Tambah Kode Sarana Angkut In/Out</CardTitle>
                                    <CardDescription>
                                        Tambahkan kode sarana angkut baru ke dalam sistem
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_sar_angkut_inout">
                                        Kode Sarana Angkut <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="kd_sar_angkut_inout"
                                        type="text"
                                        value={data.kd_sar_angkut_inout}
                                        onChange={(e) => setData('kd_sar_angkut_inout', e.target.value)}
                                        placeholder="Masukkan kode sarana angkut"
                                        maxLength={10}
                                    />
                                    {errors.kd_sar_angkut_inout && (
                                        <p className="text-sm text-red-500">{errors.kd_sar_angkut_inout}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nm_sar_angkut_inout">
                                        Nama Sarana Angkut <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nm_sar_angkut_inout"
                                        type="text"
                                        value={data.nm_sar_angkut_inout}
                                        onChange={(e) => setData('nm_sar_angkut_inout', e.target.value)}
                                        placeholder="Masukkan nama sarana angkut"
                                    />
                                    {errors.nm_sar_angkut_inout && (
                                        <p className="text-sm text-red-500">{errors.nm_sar_angkut_inout}</p>
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
                                        onClick={() => router.get('/reference/kd-sar-angkut-inout')}
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
