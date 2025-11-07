import AppLayout from '@/Layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FileText, TestTube, Users, Activity, TrendingUp, Clock } from 'lucide-react';
import { PageProps } from '@/types';

interface DashboardStats {
    totalDocuments: number;
    totalTangki: number;
    totalUsers: number;
    recentActivity: number;
}

export default function Dashboard() {
    const { auth, stats } = usePage<PageProps<{ stats: DashboardStats }>>().props;

    const statCards = [
        {
            title: 'Total Documents',
            value: stats.totalDocuments,
            description: 'Total dokumen di sistem',
            icon: FileText,
            trend: '+0%',
            color: 'text-blue-500',
        },
        {
            title: 'Total Tangki',
            value: stats.totalTangki,
            description: 'Total data tangki',
            icon: TestTube,
            trend: '+0%',
            color: 'text-green-500',
        },
        {
            title: 'Users',
            value: stats.totalUsers,
            description: 'Pengguna terdaftar',
            icon: Users,
            trend: '+0%',
            color: 'text-purple-500',
        },
        {
            title: 'Recent Activity',
            value: stats.recentActivity,
            description: 'Aktivitas hari ini',
            icon: Activity,
            trend: '+0%',
            color: 'text-orange-500',
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome back, {auth.user.name}!
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            TPS Online - Customs Document Management System
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {new Date().toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {stat.value.toLocaleString()}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {stat.description}
                                        </p>
                                        <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                                            <TrendingUp className="mr-1 h-3 w-3" />
                                            {stat.trend}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Akses cepat ke fitur utama
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <a
                                href="/documents/create"
                                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Create Document</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Buat dokumen baru</p>
                                </div>
                            </a>
                            <a
                                href="/cocotangki"
                                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                <TestTube className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">CoCoTangki Reports</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Lihat laporan tangki</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">System Status</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Status sistem dan layanan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">SOAP Service</span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Ready</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">File Storage</span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Available</span>
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
