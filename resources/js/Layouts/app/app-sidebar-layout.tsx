import { AppContent } from '@/Components/app-content';
import { AppShell } from '@/Components/app-shell';
import { AppSidebar } from '@/Components/app-sidebar';
import { AppSidebarHeader } from '@/Components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage() as any;
    const flash = props.flash || {};
    const [visibleFlash, setVisibleFlash] = useState(flash);

    // Sync visibleFlash when props.flash changes
    useEffect(() => {
        setVisibleFlash(flash);
        // Auto dismiss after 5 seconds if there's a flash message
        if (flash.success || flash.error || flash.warning || flash.info || flash.message) {
            const timer = setTimeout(() => {
                setVisibleFlash({});
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden relative">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                
                {/* GLOBAL FLASH MESSAGES */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-3 z-50">
                    {visibleFlash.success && (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="font-bold text-sm">{visibleFlash.success}</span>
                            </div>
                            <button onClick={() => setVisibleFlash({...visibleFlash, success: null})} className="text-emerald-500 hover:bg-emerald-100 rounded-full p-1 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    {visibleFlash.error && (
                        <div className="bg-rose-50 text-rose-800 border border-rose-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-rose-500" />
                                <span className="font-bold text-sm">{visibleFlash.error}</span>
                            </div>
                            <button onClick={() => setVisibleFlash({...visibleFlash, error: null})} className="text-rose-500 hover:bg-rose-100 rounded-full p-1 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    {(visibleFlash.message || visibleFlash.warning || visibleFlash.info) && (
                        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-3">
                                <Info className="h-5 w-5 text-amber-500" />
                                <span className="font-bold text-sm">{visibleFlash.message || visibleFlash.warning || visibleFlash.info}</span>
                            </div>
                            <button onClick={() => setVisibleFlash({...visibleFlash, message: null, warning: null, info: null})} className="text-amber-500 hover:bg-amber-100 rounded-full p-1 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {children}
            </AppContent>
        </AppShell>
    );
}
