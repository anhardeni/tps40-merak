import React, { useState } from 'react'
import TankVisualization from '@/Components/TankVisualization'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/Components/ui/dialog'
import { Button } from '@/Components/ui/button'
import { Eye } from 'lucide-react'

interface Tangki {
    id: number
    no_tangki: string
    jenis_isi: string
    kapasitas: number
    jumlah_isi: number
    satuan: string
    kondisi: string
}

interface TankVisualizationModalProps {
    tangki: Tangki
}

export default function TankVisualizationModal({ tangki }: TankVisualizationModalProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View 3D
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-bold">{tangki.no_tangki}</div>
                        <div className="text-sm font-normal text-slate-600">
                            {tangki.jenis_isi} - {tangki.kondisi}
                        </div>
                    </div>
                </DialogTitle>

                <div className="py-4">
                    <TankVisualization
                        kapasitas={tangki.kapasitas}
                        jumlahIsi={tangki.jumlah_isi}
                        jenis={tangki.jenis_isi}
                        width={400}
                        height={500}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
