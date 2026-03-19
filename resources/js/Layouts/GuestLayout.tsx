import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-white drop-shadow-lg" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white/95 backdrop-blur-sm px-6 py-4 shadow-2xl sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
