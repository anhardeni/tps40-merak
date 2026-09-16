import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronRight, X } from 'lucide-react';
import axios from 'axios';

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    previewUrl: string;
    confirmUrl: string;
    onSuccess: () => void;
}

interface GroupDetail {
    no_tangki: string;
    no_bl_awb: string;
    consignee: string;
    no_bc11: string;
    jml_satuan: number;
    jns_satuan: string;
    no_dok_inout: string;
    wk_inout?: string;
    no_pol?: string;
}

interface GroupMaster {
    kd_dok: string;
    kd_tps: string;
    nm_angkut: string;
    no_voy_flight: string;
    kd_gudang: string;
    ref_number?: string;
    no_dok_ijin_tps?: string;
    details: GroupDetail[];
}

export default function ExcelImportModal({
    isOpen,
    onClose,
    title,
    previewUrl,
    confirmUrl,
    onSuccess,
}: ExcelImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<{
        summary: { total_master: number; total_detail: number; total_errors: number };
        groups: GroupMaster[];
    } | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setPreviewData(null);
        }
    };

    const handleUploadPreview = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(previewUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPreviewData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Gagal memproses file Excel.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!previewData || !previewData.groups.length) return;
        setSaving(true);
        setError(null);

        try {
            const res = await axios.post(confirmUrl, { groups: previewData.groups });
            alert(res.data.message || 'Berhasil mengimpor data Excel!');
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Gagal menyimpan data impor.');
        } finally {
            setSaving(false);
        }
    };

    const toggleGroup = (index: number) => {
        setExpandedGroups((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData(null);
        setError(null);
        setExpandedGroups({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-background shadow-2xl border border-border">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">{title}</h2>
                            <p className="text-xs text-muted-foreground">Upload file Excel (.xlsx, .xls) untuk impor Master & Detail</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!previewData ? (
                        /* Step 1: File Dropzone */
                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary/50 bg-accent/20">
                            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="font-medium text-foreground mb-1">Pilih File Excel Pemasukan / Pengeluaran</p>
                            <p className="text-xs text-muted-foreground mb-4">Format disarankan sesuai contoh `Untitled spreadsheet (5).xlsx` (Master & Detail)</p>
                            
                            <label className="cursor-pointer">
                                <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow">
                                    <Upload className="h-4 w-4" /> Pilih File
                                </span>
                                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                            </label>

                            {file && (
                                <div className="mt-4 flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-foreground">
                                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                                    <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                                </div>
                            )}

                            {file && (
                                <button
                                    onClick={handleUploadPreview}
                                    disabled={loading}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {loading ? 'Menganalisis File...' : 'Pratinjau Data (Preview)'}
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Step 2: Preview Results */
                        <div className="space-y-4">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-accent/30 p-3 text-center">
                                    <span className="text-xs text-muted-foreground">Total Master Dokumen</span>
                                    <p className="text-xl font-bold text-foreground">{previewData.summary.total_master}</p>
                                </div>
                                <div className="rounded-lg border bg-accent/30 p-3 text-center">
                                    <span className="text-xs text-muted-foreground">Total Detail Tangki</span>
                                    <p className="text-xl font-bold text-foreground">{previewData.summary.total_detail}</p>
                                </div>
                                <div className="rounded-lg border bg-emerald-500/10 border-emerald-500/20 p-3 text-center">
                                    <span className="text-xs text-emerald-600 font-medium">Status Validasi</span>
                                    <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                                        <CheckCircle2 className="h-4 w-4" /> Siap Diimpor
                                    </p>
                                </div>
                            </div>

                            {/* Group List Preview */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daftar Dokumen Master & Detail:</h3>
                                <div className="max-h-72 overflow-y-auto space-y-2 rounded-lg border p-2">
                                    {previewData.groups.map((group, gIdx) => (
                                        <div key={gIdx} className="rounded-md border bg-card text-card-foreground shadow-sm">
                                            <div
                                                onClick={() => toggleGroup(gIdx)}
                                                className="flex cursor-pointer items-center justify-between p-3 hover:bg-accent/40 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {expandedGroups[gIdx] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                                    <div>
                                                        <span className="font-semibold text-sm">
                                                            {group.nm_angkut} (Voy: {group.no_voy_flight})
                                                        </span>
                                                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                                                            <span>TPS: {group.kd_tps}</span>
                                                            <span>Gudang: {group.kd_gudang}</span>
                                                            <span>Jumlah Items: {group.details.length} Tangki</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    {group.details.length} Items
                                                </span>
                                            </div>

                                            {expandedGroups[gIdx] && (
                                                <div className="border-t bg-accent/10 p-3 text-xs overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b text-muted-foreground font-semibold">
                                                                <th className="py-1 px-2">No Tangki</th>
                                                                <th className="py-1 px-2">No BL/AWB</th>
                                                                <th className="py-1 px-2">Consignee</th>
                                                                <th className="py-1 px-2">No BC11</th>
                                                                <th className="py-1 px-2">Jumlah</th>
                                                                {group.details[0]?.no_pol && <th className="py-1 px-2">No Polisi</th>}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {group.details.map((d, dIdx) => (
                                                                <tr key={dIdx} className="border-b border-border/50">
                                                                    <td className="py-1 px-2 font-mono font-medium">{d.no_tangki}</td>
                                                                    <td className="py-1 px-2">{d.no_bl_awb}</td>
                                                                    <td className="py-1 px-2 truncate max-w-[150px]">{d.consignee || '-'}</td>
                                                                    <td className="py-1 px-2">{d.no_bc11}</td>
                                                                    <td className="py-1 px-2 font-semibold">{d.jml_satuan?.toLocaleString()} {d.jns_satuan}</td>
                                                                    {d.no_pol && <td className="py-1 px-2 font-mono">{d.no_pol}</td>}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t px-6 py-4 bg-accent/10">
                    <button
                        onClick={previewData ? () => setPreviewData(null) : handleClose}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition"
                    >
                        {previewData ? 'Ganti File' : 'Batal'}
                    </button>

                    {previewData && (
                        <button
                            onClick={handleConfirmImport}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {saving ? 'Menyimpan...' : 'Konfirmasi & Simpan Impor'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
