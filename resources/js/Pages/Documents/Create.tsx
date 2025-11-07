import React from 'react'
import { Head } from '@inertiajs/react'
import { DocumentForm } from '@/Components/forms/DocumentForm'
import { router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'

interface CreateDocumentProps {
  auth: any
  referenceData: {
    kdDok: Array<{ kd_dok: string; nm_dok: string }>
    kdTps: Array<{ kd_tps: string; nm_tps: string }>
    nmAngkut: Array<{ id: number; nm_angkut: string; call_sign?: string }>
    kdGudang: Array<{ kd_gudang: string; nm_gudang: string }>
  }
}

export default function CreateDocument({ auth, referenceData }: CreateDocumentProps) {
  const handleSubmit = (data: any) => {
    router.post('/documents', data, {
      onSuccess: () => {
        // Redirect akan dilakukan oleh controller
      },
      onError: (errors) => {
        console.error('Error creating document:', errors)
      }
    })
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Dokumen', href: '/documents' },
      { title: 'Tambah Baru', href: '/documents/create' }
    ]}>
      <Head title="Tambah Dokumen" />

      <div className="space-y-6 p-4 md:p-6">
        <DocumentForm
          referenceData={referenceData}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  )
}