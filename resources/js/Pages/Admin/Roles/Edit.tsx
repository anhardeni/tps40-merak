import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import { PageProps, Permission } from '@/types';
import { useState, FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
    permissions: Permission[];
}

interface Props extends PageProps {
    role: Role;
    allPermissions: Permission[];
}

export default function RoleEdit({ role, allPermissions }: Props) {
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        role.permissions.map((p) => p.id!)
    );
    const [processing, setProcessing] = useState(false);

    const handleTogglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            route('admin.roles.permissions.sync', role.id),
            { permissions: selectedPermissions },
            {
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <AppLayout>
            <div className="container max-w-4xl mx-auto py-6">
                <div className="mb-4">
                    <Link href={route('admin.roles.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Roles
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Role: {role.display_name}</CardTitle>
                                    <CardDescription className="mt-2">
                                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                            {role.name}
                                        </code>
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">
                                    {selectedPermissions.length} / {allPermissions.length} selected
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Permissions</CardTitle>
                                <CardDescription>
                                    Select which permissions this role should have. Users with this role will
                                    inherit all selected permissions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allPermissions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No permissions available.</p>
                                        <p className="text-sm mt-2">
                                            <Link href={route('admin.permissions.create')}>
                                                <Button variant="link" className="h-auto p-0">
                                                    Create your first permission
                                                </Button>
                                            </Link>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {allPermissions.map((permission) => {
                                            const isChecked = selectedPermissions.includes(permission.id!);
                                            return (
                                                <div
                                                    key={permission.id}
                                                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={() => handleTogglePermission(permission.id!)}
                                                    />
                                                    <div className="grid gap-1.5 leading-none flex-1">
                                                        <Label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {permission.display_name}
                                                            {isChecked && (
                                                                <Check className="inline-block w-4 h-4 ml-2 text-primary" />
                                                            )}
                                                        </Label>
                                                        <p className="text-sm text-muted-foreground font-mono">
                                                            {permission.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {allPermissions.length > 0 && (
                            <div className="flex justify-end gap-3 pt-4">
                                <Link href={route('admin.roles.index')}>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Permissions'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
