import { NavFooter } from '@/Components/nav-footer';
import { NavMain } from '@/Components/nav-main';
import { NavUser } from '@/Components/nav-user';
import { Button } from '@/Components/ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarSeparator, useSidebar } from '@/Components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Folder, LayoutGrid, TestTube, FileWarning, Users, Shield, Settings, Database, PanelLeft, Key } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
    },
    {
        title: 'CoCoTangki',
        href: '/cocotangki',
        icon: Database,
    },
    {
        title: 'Logs',
        href: '/logs',
        icon: FileWarning,
    },
];

const referenceNavItems: NavItem[] = [
    {
        title: 'Kode Dokumen',
        href: '/reference/kd-dok',
        icon: FileText,
    },
    {
        title: 'Kode TPS',
        href: '/reference/kd-tps',
        icon: Database,
    },
    {
        title: 'Kode Gudang',
        href: '/reference/kd-gudang',
        icon: Database,
    },
    {
        title: 'Nama Angkutan',
        href: '/reference/nm-angkut',
        icon: Database,
    },
    {
        title: 'Kode Dokumen In/Out',
        href: '/reference/kd-dok-inout',
        icon: FileText,
    },
    {
        title: 'Kode Sarana Angkut In/Out',
        href: '/reference/kd-sar-angkut-inout',
        icon: Database,
    },
    {
        title: 'Jenis Satuan',
        href: '/reference/jenis-satuan',
        icon: Database,
    },
    {
        title: 'Jenis Kemasan',
        href: '/reference/jenis-kemasan',
        icon: Database,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
        icon: Key,
    },
];

const settingsNavItems: NavItem[] = [
    {
        title: 'Beacukai Credentials',
        href: '/admin/beacukai-credentials',
        icon: Shield,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    // Check if user is admin
    const isAdmin = auth.user?.roles?.some((role) => role.name === 'admin') || false;

    // Check permissions with admin bypass
    const hasPermission = (permissionName: string) => {
        // ADMIN BYPASS: Admin always has access
        if (isAdmin) {
            return true;
        }

        // For other roles, check permissions
        return auth.user?.roles?.some((role) =>
            role.permissions?.some((perm) => perm.name === permissionName)
        ) || false;
    };

    const canAccessReference = hasPermission('manage.references');
    const canAccessAdmin = hasPermission('manage.users');

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex items-center justify-between gap-2 px-2">
                    <SidebarMenu className="flex-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                <Link href={dashboard()} prefetch>
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <AppLogoIcon className="size-5 fill-current" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">TPS Online</span>
                                        <span className="truncate text-xs text-sidebar-foreground/70">Customs System</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <ToggleButton />
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                <NavMain items={mainNavItems} label="Main Menu" />
                <SidebarSeparator className="mx-0" />

                {canAccessReference && (
                    <>
                        <NavMain items={referenceNavItems} label="Reference Data" />
                        <SidebarSeparator className="mx-0" />
                    </>
                )}

                {canAccessAdmin && (
                    <>
                        <NavMain items={adminNavItems} label="Administration" />
                        <SidebarSeparator className="mx-0" />
                    </>
                )}                <NavMain items={settingsNavItems} label="Settings" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

function ToggleButton() {
    const { toggleSidebar, open } = useSidebar();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-sidebar-accent"
            onClick={toggleSidebar}
            title="Toggle sidebar"
        >
            <PanelLeft className={`h-4 w-4 transition-transform ${open ? '' : 'rotate-180'}`} />
        </Button>
    );
}