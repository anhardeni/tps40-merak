import React from 'react'
import { Head, router } from '@inertiajs/react'
import { DocumentForm } from '@/Components/forms/DocumentForm'
import AppLayout from '@/Layouts/app-layout'

interface AddTangkiProps {
  auth: any
  document: any
  referenceData: {
    kdDok: Array<{ kd_dok: string; nm_dok: string }>
    kdTps: Array<{ kd_tps: string; nm_tps: string }>
    nmAngkut: Array<{ id: number; nm_angkut: string; call_sign?: string }>
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string; kd_tps?: string }>
    kdDokInout: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis: string }>
    tangkiList?: string[]
  }
}

export default function AddTangki({ auth, document, referenceData }: AddTangkiProps) {
  const handleSubmit = (data: any) => {
    return new Promise<void>((resolve, reject) => {
      // Data contains the full document form schema, but we only need to send the tangki array.
      // However, the backend validation currently expects just the 'tangki' array for the append route.
      router.post(`/documents/${document.id}/append-tangki`, { tangki: data.tangki }, {
        onSuccess: () => {
          resolve()
        },
        onError: (errors) => {
          console.error('Error appending tangki:', errors)
          reject(errors)
        }
      })
    })
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Dokumen', href: '/documents' },
      { title: document.ref_number, href: `/documents/${document.id}` },
      { title: 'Tambah Tangki Susulan', href: '#' }
    ]}>
      <Head title={`Tambah Tangki Susulan - ${document.ref_number}`} />

      <div className="space-y-6 p-4 md:p-6">
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800">
          <h2 className="font-black text-lg tracking-wide uppercase">Tambah Tangki Susulan Manual</h2>
          <p className="text-slate-400 text-sm mt-1">Anda sedang menambahkan tangki baru ke dokumen yang sudah di-submit.</p>
        </div>

        <DocumentForm
          document={document}
          referenceData={referenceData}
          onSubmit={handleSubmit}
          isAppendMode={true}
        />
      </div>
    </AppLayout>
  )
}
