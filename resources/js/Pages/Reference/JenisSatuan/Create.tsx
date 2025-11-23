import { Head, useForm, Link } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function JenisSatuanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kode_satuan_barang: '',
        nama_satuan_barang: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('jenis-satuan.store'))
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Jenis Satuan" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Link href={route('jenis-satuan.index')}>
                                    <Button variant="outline" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Tambah Jenis Satuan
                                </h2>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="kode_satuan_barang">Kode Satuan</Label>
                                    <Input
                                        id="kode_satuan_barang"
                                        value={data.kode_satuan_barang}
                                        onChange={(e) => setData('kode_satuan_barang', e.target.value)}
                                        className="mt-1"
                                        placeholder="Contoh: KGM"
                                    />
                                    {errors.kode_satuan_barang && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kode_satuan_barang}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="nama_satuan_barang">Nama Satuan</Label>
                                    <Input
                                        id="nama_satuan_barang"
                                        value={data.nama_satuan_barang}
                                        onChange={(e) => setData('nama_satuan_barang', e.target.value)}
                                        className="mt-1"
                                        placeholder="Contoh: Kilogram"
                                    />
                                    {errors.nama_satuan_barang && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nama_satuan_barang}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Link href={route('jenis-satuan.index')}>
                                        <Button variant="outline" type="button">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
