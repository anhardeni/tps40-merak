import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Calendar, Building, Truck, ShieldCheck, Box } from 'lucide-react';

interface TangkiDetail {
    id: number;
    no_tangki: string;
    seri_out?: string;
    no_bl_awb: string;
    tgl_bl_awb?: string;
    consignee?: string;
    no_bc11?: string;
    tgl_bc11?: string;
    no_pos_bc11?: string;
    jml_satuan: number;
    jns_satuan: string;
    no_dok_inout?: string;
    tgl_dok_inout?: string;
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

interface DocumentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocumentMaster | null;
}

export default function DocumentDetailModal({ isOpen, onClose, document }: DocumentDetailModalProps) {
    console.log("DocumentDetailModal render", { isOpen, hasDocument: !!document, document });
    if (!isOpen || !document) return null;

    const isPemasukan = document.kd_dok === '1';

    // Helper for nm_angkut extraction
    const nmAngkutText = typeof document.nm_angkut === 'object' && document.nm_angkut !== null
        ? (document.nm_angkut as any).nm_angkut || '-'
        : (document.nm_angkut || '-');

    // Helper to format dates cleanly
    const formatDate = (val?: string) => {
        if (!val) return '-';
        if (val.includes('T')) return val.split('T')[0];
        return val;
    };

    const totalColSpan = document.kd_dok === '3' ? 9 : 7;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-background shadow-2xl border border-border">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPemasukan ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-foreground">Detail Dokumen {isPemasukan ? 'Pemasukan (Gate In)' : 'Pengeluaran (Gate Out)'}</h2>
                                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-muted-foreground font-mono">{document.ref_number}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">ID Dokumen: #{document.id} | Status: <span className="font-semibold text-primary">{document.status}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Master Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card 1: Angkutan & TPS */}
                        <div className="rounded-lg border bg-card p-4 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <Truck className="h-4 w-4 text-primary" /> Sarana Angkut & Lokasi
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-foreground">{nmAngkutText}</p>
                                <p className="text-xs text-muted-foreground">Voyage: {document.no_voy_flight || '-'}</p>
                            </div>
                            <div className="pt-2 border-t flex justify-between text-xs">
                                <div><span className="text-muted-foreground">KD TPS:</span> <span className="font-semibold">{document.kd_tps || '-'}</span></div>
                                <div><span className="text-muted-foreground">Gudang:</span> <span className="font-semibold">{document.kd_gudang || '-'}</span></div>
                            </div>
                        </div>

                        {/* Card 2: Tanggal & Waktu */}
                        <div className="rounded-lg border bg-card p-4 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <Calendar className="h-4 w-4 text-primary" /> Tanggal & Waktu
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between"><span className="text-muted-foreground">Tgl Entry:</span> <span className="font-medium">{formatDate(document.tgl_entry)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Tgl Tiba:</span> <span className="font-medium">{formatDate(document.tgl_tiba)}</span></div>
                                {document.tgl_dok_ijin_tps && <div className="flex justify-between"><span className="text-muted-foreground">Tgl Ijin TPS:</span> <span className="font-medium">{formatDate(document.tgl_dok_ijin_tps)}</span></div>}
                            </div>
                        </div>

                        {/* Card 3: Status Host & Ijin */}
                        <div className="rounded-lg border bg-card p-4 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Integrasi & Status
                            </div>
                            <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Host-to-Host:</span> 
                                    <span className={`font-semibold ${document.sent_to_host ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {document.sent_to_host ? 'Terkirim' : 'Belum Kirim'}
                                    </span>
                                </div>
                                <div className="flex justify-between"><span className="text-muted-foreground">No Ijin TPS:</span> <span className="font-medium">{document.no_dok_ijin_tps || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Total Item:</span> <span className="font-bold text-foreground">{document.tangki?.length || 0} Tangki</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Detail Items Table */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Box className="h-4 w-4 text-primary" /> Daftar Detail Tangki / Barang ({document.tangki?.length || 0})
                            </h3>
                        </div>

                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-accent/50 text-muted-foreground font-semibold border-b">
                                        <tr>
                                            <th className="py-2.5 px-3">No Tangki</th>
                                            {document.kd_dok === '3' && <th className="py-2.5 px-3">Seri Out</th>}
                                            <th className="py-2.5 px-3">No BL / AWB</th>
                                            <th className="py-2.5 px-3">Consignee</th>
                                            <th className="py-2.5 px-3">No BC11</th>
                                            <th className="py-2.5 px-3">Jumlah Satuan</th>
                                            {document.kd_dok === '3' && <th className="py-2.5 px-3">No Polisi Truk</th>}
                                            <th className="py-2.5 px-3">Waktu In/Out</th>
                                            <th className="py-2.5 px-3">Pel. Muat/Bongkar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {document.tangki && document.tangki.length > 0 ? (
                                            document.tangki.map((t, idx) => (
                                                <tr key={idx} className="hover:bg-accent/20 transition">
                                                    <td className="py-2 px-3 font-mono font-bold text-primary">{t.no_tangki || '-'}</td>
                                                    {document.kd_dok === '3' && <td className="py-2 px-3 font-mono">{t.seri_out || '-'}</td>}
                                                    <td className="py-2 px-3">{t.no_bl_awb || '-'}</td>
                                                    <td className="py-2 px-3 truncate max-w-[180px]">{t.consignee || '-'}</td>
                                                    <td className="py-2 px-3">{t.no_bc11 || '-'}</td>
                                                    <td className="py-2 px-3 font-semibold text-foreground">{Number(t.jml_satuan || 0).toLocaleString('id-ID')} {t.jns_satuan || 'KGM'}</td>
                                                    {document.kd_dok === '3' && <td className="py-2 px-3 font-mono font-medium">{t.no_pol || '-'}</td>}
                                                    <td className="py-2 px-3 text-muted-foreground">{t.wk_inout || '-'}</td>
                                                    <td className="py-2 px-3 text-muted-foreground">{t.pel_muat || '-'} / {t.pel_bongkar || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={totalColSpan} className="py-6 text-center text-muted-foreground">
                                                    Tidak ada rincian item tangki/barang pada dokumen ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end border-t px-6 py-4 bg-accent/10">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-accent transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        window.document.body
    );
}
