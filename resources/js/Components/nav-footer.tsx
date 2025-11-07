import { Icon } from '@/Components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/Components/ui/sidebar';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:hidden ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                size="sm"
                                tooltip={{ children: item.title }}
                                className="text-sidebar-foreground/70 hover:text-sidebar-foreground px-2.5"
                            >
                                <a href={typeof item.href === 'string' ? item.href : item.href.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                    {item.icon && <Icon iconNode={item.icon} className="size-4" />}
                                    <span className="text-xs">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
