import AppLayout from '@/Layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useState } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle2, FileWarning, Search, Calendar, RefreshCcw, ArrowRight, Table, XCircle, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MonitoringIndex() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('failed');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // States for data
    const [failedData, setFailedData] = useState<any>(null);
    const [sentData, setSentData] = useState<any>(null);
    const [sppbData, setSppbData] = useState<any>(null);
    const [rejectData, setRejectData] = useState<any>(null);

    // Form states
    const today = new Date().toISOString().split('T')[0];
    const formatToIndo = (dateStr: string) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}-${m}-${y}`;
    };

    const [failedForm, setFailedForm] = useState({ start: today, end: today });
    const [sentForm, setSentForm] = useState({ start: today, end: today });
    const [sppbForm, setSppbForm] = useState({ date: today, isTpb: false });
    const [rejectForm, setRejectForm] = useState({ kd_tps: '' });

    const showMessage = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 5000);
    };

    const handleCheckFailed = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/monitoring/failed-data', {
                params: {
                    tgl_awal: formatToIndo(failedForm.start),
                    tgl_akhir: formatToIndo(failedForm.end)
                }
            });
            setFailedData(response.data);
            if (response.data.success) {
                showMessage('success', 'Monitoring data gagal berhasil diperbarui');
            } else {
                showMessage('error', response.data.error || 'Gagal mengambil data dari Beacukai');
            }
        } catch (err: any) {
            showMessage('error', err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckSent = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/monitoring/sent-data', {
                params: {
                    tgl_awal: formatToIndo(sentForm.start),
                    tgl_akhir: formatToIndo(sentForm.end)
                }
            });
            setSentData(response.data);
            if (response.data.success) {
                showMessage('success', 'Monitoring data terkirim berhasil diperbarui');
            } else {
                showMessage('error', response.data.error || 'Gagal mengambil data dari Beacukai');
            }
        } catch (err: any) {
            showMessage('error', err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckSppb = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/monitoring/sppb-by-date', {
                params: {
                    tanggal: formatToIndo(sppbForm.date),
                    is_tpb: sppbForm.isTpb ? 1 : 0
                }
            });
            setSppbData(response.data);
            if (response.data.success) {
                showMessage('success', `Data SPPB ${sppbForm.isTpb ? 'TPB' : ''} berhasil diperbarui`);
            } else {
                showMessage('error', response.data.error || 'Gagal mengambil data dari Beacukai');
            }
        } catch (err: any) {
            showMessage('error', err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckReject = async () => {
        if (!rejectForm.kd_tps) {
            showMessage('error', 'Kode TPS wajib diisi');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get('/api/monitoring/reject-data', {
                params: {
                    kd_tps: rejectForm.kd_tps
                }
            });
            setRejectData(response.data);
            if (response.data.success) {
                showMessage('success', 'Data reject berhasil diperbarui');
            } else {
                showMessage('error', response.data.error || 'Gagal mengambil data dari Beacukai');
            }
        } catch (err: any) {
            showMessage('error', err.response?.data?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    const renderRefNumbers = (resp: any) => {
        const refNo = resp?.REF_NO?.RN;
        if (!refNo) return <p className="text-sm text-gray-500 italic">Tidak ada rincian REF_NUMBER</p>;
        
        const rnList = Array.isArray(refNo) ? refNo : [refNo];
        
        return (
            <div className="mt-4 border rounded-md overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b p-2 text-xs font-bold flex items-center gap-2">
                    <Table className="h-3 w-3" /> Daftar REF_NUMBER ({rnList.length})
                </div>
                <div className="max-h-60 overflow-y-auto p-2 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {rnList.map((rn: string, idx: number) => (
                            <div key={idx} className="text-[10px] font-mono bg-slate-50 border p-1 rounded text-center truncate hover:border-blue-300 transition-colors">
                                {rn}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderSppbNumbers = (resp: any) => {
        if (!resp) return null;
        if (typeof resp === 'string') return <p className="text-sm text-amber-600 font-medium bg-amber-50 p-3 rounded-md border border-amber-200">{resp}</p>;
        
        const sppbNoList = resp?.SPPB_NO?.DT;
        if (!sppbNoList) return <p className="text-sm text-gray-500 italic">Tidak ada rincian nomor SPPB</p>;
        
        const dtList = Array.isArray(sppbNoList) ? sppbNoList : [sppbNoList];
        
        return (
            <div className="mt-4 border rounded-md overflow-hidden bg-white shadow-sm">
                <div className="bg-blue-50 border-b p-2 text-xs font-bold flex items-center gap-2 text-blue-700">
                    <Table className="h-3 w-3" /> Daftar Nomor SPPB ({dtList.length})
                </div>
                <div className="max-h-72 overflow-y-auto p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {dtList.map((dt: string, idx: number) => (
                            <div key={idx} className="text-[11px] font-semibold bg-slate-50 border border-slate-200 p-2 rounded text-center truncate hover:border-blue-300 transition-colors">
                                {dt}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderRejectData = (result: any) => {
        // XML structure: <DOCUMENT><REJECT><REF_NUMBER>...
        const document = result?.DOCUMENT || result?.data?.DOCUMENT;
        if (!document || !document.REJECT) return <p className="text-sm text-gray-500 italic p-4 text-center border rounded-md">Tidak ada data penolakan ditemukan.</p>;

        const rejects = Array.isArray(document.REJECT) ? document.REJECT : [document.REJECT];

        return (
            <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm border-red-200">
                <div className="bg-red-50 border-b border-red-200 p-3 text-xs font-bold flex items-center gap-2 text-red-700 uppercase tracking-wider">
                    <FileX className="h-4 w-4" /> Rincian Data Reject ({rejects.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b">
                            <tr>
                                <th className="p-3">Ref Number</th>
                                <th className="p-3">Kontainer</th>
                                <th className="p-3">Kode Reject</th>
                                <th className="p-3">Tanggal Reject</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rejects.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                    <td className="p-3 font-mono text-xs">{item.REF_NUMBER || '-'}</td>
                                    <td className="p-3 text-xs">{item.NO_CONT || '-'}</td>
                                    <td className="p-3 text-xs">
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {item.KD_REJECT || '-'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-xs text-slate-500">{item.TGL_REJECT || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Monitoring Beacukai" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-6 w-6 text-blue-500" />
                            Monitoring Beacukai
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Cek status transmisi data, informasi SPPB, dan data reject langsung dari server Beacukai (SOAP).
                        </p>
                    </div>
                </div>

                {statusMessage && (
                    <div className={cn(
                        "p-4 rounded-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2",
                        statusMessage.type === 'success' ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                    )}>
                        {statusMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        <span className="text-sm font-medium">{statusMessage.text}</span>
                    </div>
                )}

                <div className="flex flex-col space-y-4">
                    {/* CUSTOM TABS */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-max border overflow-x-auto max-w-full">
                        {[
                            { id: 'failed', label: 'Data Gagal Kirim', icon: FileWarning },
                            { id: 'sent', label: 'Data Terkirim', icon: CheckCircle2 },
                            { id: 'sppb', label: 'Data SPPB', icon: Calendar },
                            { id: 'reject', label: 'Data Reject', icon: XCircle },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                    activeTab === tab.id 
                                        ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" 
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* FAILED DATA TAB */}
                    {activeTab === 'failed' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filter Data Gagal Kirim</CardTitle>
                                    <CardDescription>Cek REF NUMBER yang tidak berhasil masuk ke database DJBC</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="space-y-2">
                                            <Label>Tanggal Awal</Label>
                                            <Input 
                                                type="date" 
                                                value={failedForm.start} 
                                                onChange={(e) => setFailedForm({...failedForm, start: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center h-10 text-gray-400">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal Akhir</Label>
                                            <Input 
                                                type="date" 
                                                value={failedForm.end} 
                                                onChange={(e) => setFailedForm({...failedForm, end: e.target.value})}
                                            />
                                        </div>
                                        <Button onClick={handleCheckFailed} disabled={loading} className="gap-2">
                                            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            Cek Sekarang
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {failedData && (
                                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                    <AlertCircle className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <CardTitle>Hasil Cek Data Gagal</CardTitle>
                                                    <CardDescription>Rentang: {formatToIndo(failedForm.start)} s/d {formatToIndo(failedForm.end)}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-red-600">
                                                    {failedData.data?.RESPON?.JUMLAH || 0}
                                                </span>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total Transaksi</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="mt-4">
                                        {renderRefNumbers(failedData.data?.RESPON)}
                                        {failedData.duration && (
                                            <p className="text-[10px] text-gray-400 mt-4 italic">Response time: {failedData.duration}ms</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* SENT DATA TAB */}
                    {activeTab === 'sent' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filter Data Terkirim</CardTitle>
                                    <CardDescription>Monitor jumlah data yang berhasil masuk dan valid di database DJBC</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="space-y-2">
                                            <Label>Tanggal Awal</Label>
                                            <Input 
                                                type="date" 
                                                value={sentForm.start} 
                                                onChange={(e) => setSentForm({...sentForm, start: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center h-10 text-gray-400">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tanggal Akhir</Label>
                                            <Input 
                                                type="date" 
                                                value={sentForm.end} 
                                                onChange={(e) => setSentForm({...sentForm, end: e.target.value})}
                                            />
                                        </div>
                                        <Button onClick={handleCheckSent} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
                                            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            Cek Sekarang
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {sentData && (
                                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <CheckCircle2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <CardTitle>Hasil Cek Data Terkirim</CardTitle>
                                                    <CardDescription>Rentang: {formatToIndo(sentForm.start)} s/d {formatToIndo(sentForm.end)}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-green-600">
                                                    {sentData.data?.RESPON?.JUMLAH || 0}
                                                </span>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Total Transaksi</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="mt-4">
                                        {renderRefNumbers(sentData.data?.RESPON)}
                                        {sentData.duration && (
                                            <p className="text-[10px] text-gray-400 mt-4 italic">Response time: {sentData.duration}ms</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* SPPB DATA TAB */}
                    {activeTab === 'sppb' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filter Data SPPB</CardTitle>
                                    <CardDescription>Cek jumlah dokumen SPPB untuk tanggal tertentu.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="space-y-2">
                                            <Label>Tanggal SPPB</Label>
                                            <Input 
                                                type="date" 
                                                value={sppbForm.date} 
                                                onChange={(e) => setSppbForm({...sppbForm, date: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 h-10 self-end mb-1">
                                            <input 
                                                type="checkbox" 
                                                id="isTpb" 
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                                checked={sppbForm.isTpb}
                                                onChange={(e) => setSppbForm({...sppbForm, isTpb: e.target.checked})}
                                            />
                                            <Label htmlFor="isTpb" className="font-normal cursor-pointer">Cek khusus TPB</Label>
                                        </div>
                                        <Button onClick={handleCheckSppb} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            Cek SPPB
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {sppbData && (
                                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                    <Calendar className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <CardTitle>Laporan Data SPPB {sppbForm.isTpb ? 'TPB' : ''}</CardTitle>
                                                    <CardDescription>Tanggal: {formatToIndo(sppbForm.date)}</CardDescription>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-blue-600">
                                                    {sppbData.data?.RESPON?.JUMLAH || 0}
                                                </span>
                                                <p className="text-xs text-gray-500 uppercase font-bold">Dokumen SPPB</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="mt-4">
                                        {renderSppbNumbers(sppbData.data?.RESPON)}
                                        <div className="mt-6 border rounded-lg p-4 bg-slate-50/50 shadow-sm border-dashed">
                                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Info Sinkronisasi</h4>
                                            <div className="flex items-center justify-between">
                                                 <p className="text-xs text-slate-600">Status koneksi DJBC:</p>
                                                 <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
                                                     <CheckCircle2 className="h-3 w-3" /> Aktif
                                                 </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* REJECT DATA TAB */}
                    {activeTab === 'reject' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                                        <FileX className="h-5 w-5" /> Filter Data Reject Beacukai
                                    </CardTitle>
                                    <CardDescription>Lihat rincian kesalahan validasi per kode TPS dari server DJBC</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div className="space-y-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="kdTps">Kode TPS</Label>
                                            <Input 
                                                id="kdTps"
                                                placeholder="Masukkan Kode TPS (Contoh: KOJA)" 
                                                value={rejectForm.kd_tps} 
                                                onChange={(e) => setRejectForm({...rejectForm, kd_tps: e.target.value.toUpperCase()})}
                                            />
                                        </div>
                                        <Button onClick={handleCheckReject} disabled={loading} className="gap-2 bg-red-600 hover:bg-red-700">
                                            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                            Tampilkan Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {rejectData && (
                                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                                    <CardContent className="p-0">
                                        {renderRejectData(rejectData.data)}
                                        {rejectData.duration && (
                                            <div className="px-6 pb-4">
                                                <p className="text-[10px] text-gray-400 italic">Response time: {rejectData.duration}ms</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
