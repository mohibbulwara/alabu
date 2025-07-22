
'use client';

import { useState } from 'react';
import type { AdminLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

export default function LogsTable({ initialLogs }: { initialLogs: AdminLog[] }) {
    const [logs] = useState(initialLogs);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Audit Trail</CardTitle>
                <CardDescription>A record of all administrative actions performed on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Admin</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="font-medium">{log.adminName}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{log.adminId}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-start gap-2">
                                            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p>{log.action}</p>
                                                {log.targetId && (
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        Target: {log.targetType}/{log.targetId}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {log.timestamp ? formatDistanceToNow(new Date(log.timestamp as string), { addSuffix: true }) : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
