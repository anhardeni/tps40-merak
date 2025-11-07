import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const [justUpdated, setJustUpdated] = useState<Appearance | null>(null);

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'dim', icon: Sparkles, label: 'Dim' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const handleUpdateAppearance = (value: Appearance) => {
        const success = updateAppearance(value);
        
        if (success) {
            setJustUpdated(value);
            
            // Clear success indicator after 2 seconds
            setTimeout(() => {
                setJustUpdated(null);
            }, 2000);
        }
    };

    return (
        <div className="space-y-4">
            <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} {...props}>
                {tabs.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        onClick={() => handleUpdateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors relative',
                            appearance === value
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                        {justUpdated === value && (
                            <Check className="ml-1.5 h-4 w-4 text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-200" />
                        )}
                    </button>
                ))}
            </div>
            
            {justUpdated && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1 duration-300">
                    <Check className="h-4 w-4" />
                    <span>Appearance updated successfully</span>
                </div>
            )}
        </div>
    );
}
