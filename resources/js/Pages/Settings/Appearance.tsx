import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/Components/appearance-tabs';
import HeadingSmall from '@/Components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/Layouts/app-layout';
import SettingsLayout from '@/Layouts/settings/layout';
import { appearance } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: appearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
