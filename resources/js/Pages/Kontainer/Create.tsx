import React from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/app-layout'
import { KontainerForm } from '@/Components/forms/KontainerForm'

interface Props {
  auth: any
  referenceData: {
    kdTps: any[]
    kdGudang: any[]
    kdDok: any[]
  }
}

export default function Create({ referenceData }: Props) {
  const handleSubmit = (data: any) => {
    router.post('/kontainer', data, {
      onSuccess: () => {
        console.log('Document created successfully')
      },
      onError: (errors) => {
        console.error('Error creating document:', errors)
      }
    })
  }

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: '/' },
      { title: 'Kontainer', href: '/kontainer' },
      { title: 'Tambah Baru', href: '/kontainer/create' }
    ]}>
      <Head title="Entry Kontainer Baru" />

      <div className="p-4 md:p-6">
        <div className="mb-8">
           <h1 className="text-4xl font-black tracking-tighter uppercase">Entry Kontainer</h1>
           <p className="text-slate-500 font-medium tracking-widest text-xs uppercase">Beacukai OpenAPI REST Protocol</p>
        </div>
        <KontainerForm
          referenceData={referenceData}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  )
}
