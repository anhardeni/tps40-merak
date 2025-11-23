import { FormEvent } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import { Checkbox } from '@/Components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function NmAngkutCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nm_angkut: '',
        call_sign: '',
        jenis_angkutan: '',
        bendera: '',
        is_active: true,
    })

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post('/reference/nm-angkut')
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Nama Angkutan" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => router.get('/reference/nm-angkut')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <CardTitle>Tambah Nama Angkutan</CardTitle>
                                    <CardDescription>Tambahkan nama angkutan baru.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nm_angkut">Nama Angkutan <span className="text-red-500">*</span></Label>
                                    <Input id="nm_angkut" type="text" value={data.nm_angkut} onChange={(e) => setData('nm_angkut', e.target.value)} placeholder="Masukkan nama angkutan" />
                                    {errors.nm_angkut && <p className="text-sm text-red-500">{errors.nm_angkut}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="call_sign">Call Sign</Label>
                                    <Input id="call_sign" type="text" value={data.call_sign} onChange={(e) => setData('call_sign', e.target.value)} placeholder="Call sign (opsional)" />
                                    {errors.call_sign && <p className="text-sm text-red-500">{errors.call_sign}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jenis_angkutan">Jenis Angkutan</Label>
                                    <Input id="jenis_angkutan" type="text" value={data.jenis_angkutan} onChange={(e) => setData('jenis_angkutan', e.target.value)} placeholder="Contoh: kapal, pesawat" />
                                    {errors.jenis_angkutan && <p className="text-sm text-red-500">{errors.jenis_angkutan}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bendera">Bendera</Label>
                                    <Input id="bendera" type="text" value={data.bendera} onChange={(e) => setData('bendera', e.target.value)} placeholder="Negara bendera (opsional)" />
                                    {errors.bendera && <p className="text-sm text-red-500">{errors.bendera}</p>}
                                </div>

                                <div className="flex items-center gap-4">
                                    <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked: boolean) => setData('is_active', checked)} />
                                    <Label htmlFor="is_active" className="cursor-pointer">Aktif</Label>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="outline" onClick={() => router.get('/reference/nm-angkut')}>Batal</Button>
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
