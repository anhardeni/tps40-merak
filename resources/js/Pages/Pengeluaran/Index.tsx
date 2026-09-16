import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Search,
    FileSpreadsheet,
    ArrowUpRight,
    ChevronDown,
    ChevronRight,
    Eye,
    Trash2,
    Truck,
    Box,
    CheckCircle2,
    Database,
} from 'lucide-react';
import ExcelImportModal from '@/Components/ExcelImportModal';
import DocumentDetailModal from '@/Components/DocumentDetailModal';

interface TangkiDetail {
    id: number;
    no_tangki: string;
    seri_out?: string;
    no_bl_awb: string;
    consignee?: string;
    no_bc11?: string;
    jml_satuan: number;
    jns_satuan: string;
    no_dok_inout?: string;
    wk_inout?: string;
    no_pol?: string;
    pel_muat?: string;
    pel_bongkar?: string;
}

interface DocumentMaster {
    id: number;
    ref_number: string;
    kd_dok: string;
    kd_tps: string;
    kd_gudang: string;
    no_voy_flight?: string;
    call_sign?: string;
    tgl_tiba?: string;
    tgl_entry: string;
    status: string;
    sent_to_host: boolean;
    no_dok_ijin_tps?: string;
    tgl_dok_ijin_tps?: string;
    nm_angkut?: { nm_angkut: string };
    tangki?: TangkiDetail[];
}

interface Props {
    documents: {
        data: DocumentMaster[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        start_date?: string;
        end_date?: string;
        status?: string;
    };
    stats: {
        totalDocuments: number;
        totalVolume: number;
        totalTrucks: number;
        sentToHost: number;
    };
}

export default function PengeluaranIndex({ documents, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<DocumentMaster | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/pengeluaran', { search, start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus Dokumen Pengeluaran ini?')) {
            router.delete(`/pengeluaran/${id}`);
        }
    };

    const openDetailModal = (doc: DocumentMaster) => {
        setSelectedDocument(doc);
        setIsDetailModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Pengeluaran (Gate Out)', href: '/pengeluaran' }]}>
            <Head title="Pengeluaran (Gate Out) - TPS Online" />

            <div className="space-y-6 p-6">
                {/* Header & Title */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dokumen Pengeluaran (Gate Out)</h1>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200">
                                KD_DOK = 3
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Kelola laporan barang/tangki yang keluar dari kawasan TPS / Terminal via Truk/Armada</p>
                    </div>

                    <Button onClick={() => setIsImportModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow">
                        <FileSpreadsheet className="h-4 w-4" /> Upload Excel Pengeluaran
                    </Button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Dokumen Outbound</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                            <p className="text-xs text-muted-foreground mt-1">Dokumen Pengeluaran terdaftar</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Armada Truk</CardTitle>
                            <Truck className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTrucks}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pengeluaran terdaftar No Polisi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Volume / Berat</CardTitle>
                            <Database className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalVolume?.toLocaleString()} KGM</div>
                            <p className="text-xs text-muted-foreground mt-1">Volume muatan terdata</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Status Host-to-Host</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sentToHost} / {stats.totalDocuments}</div>
                            <p className="text-xs text-muted-foreground mt-1">Dokumen terkirim ke Bea Cukai</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter & Search Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Pencarian (Ref Number, BL, BC11, Consignee, No Polisi, Tangki)</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari BL, BC11, No Polisi, Consignee, No Tangki..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="w-full md:w-40 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>

                            <div className="w-full md:w-40 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>

                            <Button type="submit" variant="secondary" className="gap-2">
                                <Search className="h-4 w-4" /> Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Expandable Master-Detail Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold">Daftar Dokumen Master & Detail Tangki Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-accent/40">
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Ref Number</TableHead>
                                    <TableHead>Sarana Angkut / Vessel</TableHead>
                                    <TableHead>Tgl Entry / Out</TableHead>
                                    <TableHead>Consignee / Pemilik</TableHead>
                                    <TableHead>BL / BC11 Utama</TableHead>
                                    <TableHead>No Polisi Truk Utama</TableHead>
                                    <TableHead>Detail Items</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.length > 0 ? (
                                    documents.data.map((doc) => {
                                        const isExpanded = !!expandedRows[doc.id];
                                        const firstTangki = doc.tangki && doc.tangki[0];

                                        return (
                                            <React.Fragment key={doc.id}>
                                                {/* Master Row */}
                                                <TableRow className={`cursor-pointer transition hover:bg-accent/30 ${isExpanded ? 'bg-accent/20' : ''}`}>
                                                    <TableCell onClick={() => toggleRow(doc.id)} className="p-2 text-center">
                                                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)} className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                                        {doc.ref_number}
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)}>
                                                        <div className="font-semibold">{doc.nm_angkut?.nm_angkut || '-'}</div>
                                                        <div className="text-xs text-muted-foreground">Voy: {doc.no_voy_flight || '-'}</div>
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)}>
                                                        <div className="text-xs font-medium">{doc.tgl_entry}</div>
                                                        <div className="text-[10px] text-muted-foreground">Entry Time</div>
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)} className="max-w-[200px] truncate text-xs">
                                                        {firstTangki?.consignee || '-'}
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)}>
                                                        <div className="text-xs font-medium">BL: {firstTangki?.no_bl_awb || '-'}</div>
                                                        <div className="text-[10px] text-muted-foreground">BC11: {firstTangki?.no_bc11 || '-'}</div>
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)}>
                                                        <span className="font-mono text-xs font-bold text-foreground bg-accent/60 px-2 py-0.5 rounded">
                                                            {firstTangki?.no_pol || '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell onClick={() => toggleRow(doc.id)}>
                                                        <Badge variant="secondary" className="font-medium">
                                                            {doc.tangki?.length || 0} Tangki
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button size="icon" variant="ghost" title="Lihat Detail" onClick={() => openDetailModal(doc)}>
                                                                <Eye className="h-4 w-4 text-primary" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" title="Hapus Dokumen" onClick={() => handleDelete(doc.id)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Child Accordion Row */}
                                                {isExpanded && (
                                                    <TableRow className="bg-accent/10 hover:bg-accent/10">
                                                        <TableCell colSpan={9} className="p-4">
                                                            <div className="rounded-lg border bg-background p-3 shadow-inner">
                                                                <div className="flex items-center justify-between mb-2 pb-2 border-b">
                                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Box className="h-3.5 w-3.5 text-amber-600" /> Rincian Tangki Pengeluaran (Document #{doc.id})
                                                                    </span>
                                                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openDetailModal(doc)}>
                                                                        Buka Modal Detail
                                                                    </Button>
                                                                </div>

                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-left text-xs">
                                                                        <thead>
                                                                            <tr className="border-b text-muted-foreground font-semibold">
                                                                                <th className="py-1.5 px-2">No Tangki</th>
                                                                                <th className="py-1.5 px-2">Seri Out</th>
                                                                                <th className="py-1.5 px-2">No BL/AWB</th>
                                                                                <th className="py-1.5 px-2">Consignee</th>
                                                                                <th className="py-1.5 px-2">No BC11</th>
                                                                                <th className="py-1.5 px-2">No Polisi Truk</th>
                                                                                <th className="py-1.5 px-2">Waktu Gate Out</th>
                                                                                <th className="py-1.5 px-2">Jumlah Satuan</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {doc.tangki && doc.tangki.length > 0 ? (
                                                                                doc.tangki.map((t, tIdx) => (
                                                                                    <tr key={tIdx} className="border-b border-border/40">
                                                                                        <td className="py-1.5 px-2 font-mono font-bold text-amber-600">{t.no_tangki}</td>
                                                                                        <td className="py-1.5 px-2 font-mono">{t.seri_out || '-'}</td>
                                                                                        <td className="py-1.5 px-2">{t.no_bl_awb}</td>
                                                                                        <td className="py-1.5 px-2 truncate max-w-[150px]">{t.consignee || '-'}</td>
                                                                                        <td className="py-1.5 px-2">{t.no_bc11}</td>
                                                                                        <td className="py-1.5 px-2 font-mono font-semibold">{t.no_pol || '-'}</td>
                                                                                        <td className="py-1.5 px-2 text-muted-foreground">{t.wk_inout || '-'}</td>
                                                                                        <td className="py-1.5 px-2 font-semibold">{t.jml_satuan?.toLocaleString()} {t.jns_satuan}</td>
                                                                                    </tr>
                                                                                ))
                                                                            ) : (
                                                                                <tr>
                                                                                    <td colSpan={8} className="py-2 text-center text-muted-foreground">Tidak ada detail tangki.</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                                            Belum ada Dokumen Pengeluaran. Klik "Upload Excel Pengeluaran" untuk mengimpor data.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Excel Import Modal */}
            <ExcelImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Upload Excel Pengeluaran (Gate Out)"
                previewUrl="/pengeluaran/import-preview"
                confirmUrl="/pengeluaran/import-confirm"
                onSuccess={() => router.reload()}
            />

            {/* Document Detail Modal */}
            <DocumentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                document={selectedDocument}
            />
        </AppLayout>
    );
}
