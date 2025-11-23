import { Head, useForm, Link } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function JenisKemasanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        kode_jenis_kemasan: '',
        nama_jenis_kemasan: '',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('jenis-kemasan.store'))
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Jenis Kemasan" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Link href={route('jenis-kemasan.index')}>
                                    <Button variant="outline" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                    Tambah Jenis Kemasan
                                </h2>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <Label htmlFor="kode_jenis_kemasan">Kode Kemasan</Label>
                                    <Input
                                        id="kode_jenis_kemasan"
                                        value={data.kode_jenis_kemasan}
                                        onChange={(e) => setData('kode_jenis_kemasan', e.target.value)}
                                        className="mt-1"
                                        placeholder="Contoh: CT"
                                    />
                                    {errors.kode_jenis_kemasan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.kode_jenis_kemasan}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="nama_jenis_kemasan">Nama Kemasan</Label>
                                    <Input
                                        id="nama_jenis_kemasan"
                                        value={data.nama_jenis_kemasan}
                                        onChange={(e) => setData('nama_jenis_kemasan', e.target.value)}
                                        className="mt-1"
                                        placeholder="Contoh: CARTON"
                                    />
                                    {errors.nama_jenis_kemasan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.nama_jenis_kemasan}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Link href={route('jenis-kemasan.index')}>
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
