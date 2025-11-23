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

interface KdTps {
    kd_tps: string
    nm_tps: string
}

interface Props {
    kdGudang: {
        kd_gudang: string
        nm_gudang: string
        kd_tps: string
        alamat?: string
        kapasitas?: number
        is_active: boolean
    }
    kdTpsList: KdTps[]
}

export default function KdGudangEdit({ kdGudang, kdTpsList }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        kd_gudang: kdGudang.kd_gudang,
        nm_gudang: kdGudang.nm_gudang,
        kd_tps: kdGudang.kd_tps || '',
        alamat: kdGudang.alamat || '',
        kapasitas: kdGudang.kapasitas ?? '',
        is_active: kdGudang.is_active ?? true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        put(`/reference/kd-gudang/${kdGudang.kd_gudang}`)
    }

    return (
        <AuthenticatedLayout>
            <Head title="Edit Kode Gudang" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.get('/reference/kd-gudang')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Edit Kode Gudang</CardTitle>
                                    <CardDescription>Perbarui informasi kode gudang</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="kd_gudang">Kode Gudang</Label>
                                    <Input id="kd_gudang" type="text" value={data.kd_gudang} readOnly />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nm_gudang">Nama Gudang <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="nm_gudang"
                                        type="text"
                                        value={data.nm_gudang}
                                        onChange={(e) => setData('nm_gudang', e.target.value)}
                                        placeholder="Masukkan nama gudang"
                                    />
                                    {errors.nm_gudang && (
                                        <p className="text-sm text-red-500">{errors.nm_gudang}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kd_tps">Kode TPS <span className="text-red-500">*</span></Label>
                                    <Select value={data.kd_tps} onValueChange={(v) => setData('kd_tps', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih TPS" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kdTpsList.map((tps) => (
                                                <SelectItem key={tps.kd_tps} value={tps.kd_tps}>
                                                    {tps.kd_tps} - {tps.nm_tps}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.kd_tps && (
                                        <p className="text-sm text-red-500">{errors.kd_tps}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Textarea
                                        id="alamat"
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.alamat && (
                                        <p className="text-sm text-red-500">{errors.alamat}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kapasitas">Kapasitas (m³)</Label>
                                    <Input
                                        id="kapasitas"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.kapasitas as any}
                                        onChange={(e) => setData('kapasitas', e.target.value)}
                                        placeholder="Masukkan kapasitas (opsional)"
                                    />
                                    {errors.kapasitas && (
                                        <p className="text-sm text-red-500">{errors.kapasitas}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Checkbox
                                        id="is_active"
                                        checked={!!data.is_active}
                                        onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => router.get('/reference/kd-gudang')}>Batal</Button>
                                    <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
