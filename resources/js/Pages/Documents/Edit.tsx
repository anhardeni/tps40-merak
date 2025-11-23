import React from 'react'
import { Head } from '@inertiajs/react'
import { DocumentForm } from '@/Components/forms/DocumentForm'
import { router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'

interface EditDocumentProps {
  auth: any
  document: any
  referenceData: {
    kdDok: Array<{ kd_dok: string; nm_dok: string }>
    kdTps: Array<{ kd_tps: string; nm_tps: string }>
    nmAngkut: Array<{ id: number; nm_angkut: string; call_sign?: string }>
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string }>
    kdDokInout: Array<{ kd_dok_inout: string; nm_dok_inout: string; jenis?: string }>
    jenisSatuan: Array<{ kode_satuan_barang: string; nama_satuan_barang: string }>
    jenisKemasan: Array<{ kode_jenis_kemasan: string; nama_jenis_kemasan: string }>
  }
}

export default function EditDocument({ auth, document, referenceData }: EditDocumentProps) {
  const handleSubmit = (data: any) => {
    router.put(`/documents/${document.id}`, data, {
      onSuccess: () => {
        // Redirect akan dilakukan oleh controller
      },
      onError: (errors) => {
        console.error('Error updating document:', errors)
      }
    })
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Dokumen', href: '/documents' },
      { title: 'Edit', href: `/documents/${document.id}/edit` }
    ]}>
      <Head title={`Edit Dokumen ${document.ref_number}`} />

      <div className="space-y-6 p-4 md:p-6">
        <DocumentForm
          document={document}
          referenceData={referenceData}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  )
}