import AppLayout from '@/Layouts/app-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Link, router } from '@inertiajs/react';
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import { PageProps } from '@/types';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    created_at: string;
}

interface Props extends PageProps {
    permissions: Permission[];
}

export default function PermissionsIndex({ permissions }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
            router.delete(route('admin.permissions.destroy', id));
        }
    };

    return (
        <AppLayout>
            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle>Permissions Management</CardTitle>
                            <CardDescription>
                                Manage system permissions. Permissions control access to specific features and pages.
                            </CardDescription>
                        </div>
                        <Link href={route('admin.permissions.create')}>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Permission
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No permissions found. Create your first permission to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    permissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-mono text-sm">{permission.name}</TableCell>
                                            <TableCell>{permission.display_name}</TableCell>
                                            <TableCell>{new Date(permission.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.permissions.edit', permission.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <SquarePen className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(permission.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
