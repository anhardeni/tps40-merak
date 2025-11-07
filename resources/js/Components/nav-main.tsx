import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/Components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label }: { items: NavItem[]; label?: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            {label && <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70">{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(typeof item.href === 'string' ? item.href : item.href.url)}
                            tooltip={{ children: item.title }}
                            className="px-2.5 py-2"
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-3">
                                {item.icon && <item.icon className="size-4" />}
                                <span className="flex-1">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
