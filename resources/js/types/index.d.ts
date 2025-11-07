export interface Permission {
    id?: number;
    name: string;
    display_name: string;
    created_at?: string;
}

export interface Role {
    id?: number;
    name: string;
    display_name?: string;
    permissions?: Permission[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string;
    roles?: Role[];
}

export interface NavItem {
    title: string;
    href: string | any;
    icon?: any;
    items?: NavItem[];
}

export interface BreadcrumbItem {
    label?: string;
    title?: string;
    href?: string;
}

export interface SharedData extends PageProps {
    sidebarOpen?: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
