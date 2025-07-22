
'use client';

import { useState } from 'react';
import type { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle, FileDown } from 'lucide-react';
import { exportOrdersToPDF } from '@/lib/pdf-generator';

const getStatusVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Preparing': return 'secondary';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
    switch (status) {
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'Preparing': return <Package className="h-4 w-4 text-blue-500" />;
        case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
    }
};

const HIGH_VALUE_THRESHOLD = 10000;

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const handleExport = () => {
        exportOrdersToPDF(orders);
    }

    return (
         <Card>
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Order Management</CardTitle>
                        <CardDescription>A list of all orders on the platform.</CardDescription>
                    </div>
                    <Button onClick={handleExport} variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Buyer ID</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedOrders.map(order => {
                            const isHighValue = order.total >= HIGH_VALUE_THRESHOLD;
                            return (
                                <TableRow key={order.id} className={isHighValue ? 'bg-destructive/10' : ''}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {isHighValue && <AlertTriangle className="h-4 w-4 text-destructive" title="High-Value Order"/>}
                                            <span className="font-medium">#{order.id?.substring(0, 6)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.createdAt ? format(new Date(order.createdAt as string), 'PPpp') : 'N/A'}</TableCell>
                                    <TableCell className="font-mono text-xs">{order.buyerId}</TableCell>
                                    <TableCell>৳{order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize flex items-center gap-1 w-fit">
                                            <OrderStatusIcon status={order.status} />
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                 </Table>
                 <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
