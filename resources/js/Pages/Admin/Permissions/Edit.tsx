import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info } from 'lucide-react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
}

interface Props extends PageProps {
    permission: Permission;
}

export default function PermissionEdit({ permission }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
        display_name: permission.display_name,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.permissions.update', permission.id));
    };

    return (
        <AppLayout>
            <div className="container max-w-2xl mx-auto py-6">
                <div className="mb-4">
                    <Link href={route('admin.permissions.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Permissions
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Permission</CardTitle>
                        <CardDescription>
                            Update the permission details below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    Permission names should be lowercase with dots separating words (e.g.,
                                    "manage.users", "export.json"). These are used in code and routes.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Permission Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., manage.users"
                                    className="font-mono"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Use dot notation for hierarchical permissions (e.g., manage.users, export.json)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="display_name">
                                    Display Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="display_name"
                                    type="text"
                                    value={data.display_name}
                                    onChange={(e) => setData('display_name', e.target.value)}
                                    placeholder="e.g., Manage Users"
                                    required
                                />
                                {errors.display_name && (
                                    <p className="text-sm text-destructive">{errors.display_name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Human-readable name shown in the admin interface
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Link href={route('admin.permissions.index')}>
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Permission'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
