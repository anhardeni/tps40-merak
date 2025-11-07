import { Breadcrumbs } from '@/Components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { SidebarTrigger } from '@/Components/ui/sidebar';
import { UserMenuContent } from '@/Components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* User Menu with Logout */}
            <div className="ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center size-10 rounded-full p-1 hover:bg-accent transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
