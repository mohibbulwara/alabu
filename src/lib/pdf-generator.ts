
'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import type { User, Dish, Order } from '@/types';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const generatePdf = (title: string, head: any[], body: any[], filename: string) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text(title, 14, 22);

    doc.autoTable({
        head,
        body,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [34, 34, 34] }, // Dark grey for header
    });
    
    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ---- User Export ----
export const exportUsersToPDF = (users: User[]) => {
    const tableHead = [['Name', 'Email', 'Role', 'Status', 'Joined']];
    const tableBody = users.map(user => [
        user.name,
        user.email,
        user.role,
        user.isSuspended ? 'Suspended' : 'Active',
        user.createdAt ? format(new Date(user.createdAt as string), 'PP') : 'N/A'
    ]);

    generatePdf('User List', tableHead, tableBody, 'chefs_bd_users');
};


// ---- Dish Export ----
export const exportDishesToPDF = (dishes: Dish[]) => {
    const tableHead = [['Name', 'Category', 'Price (BDT)', 'Seller ID']];
    const tableBody = dishes.map(dish => [
        dish.name,
        dish.category,
        dish.price.toFixed(2),
        dish.sellerId.substring(0, 10) + '...'
    ]);

    generatePdf('Dish List', tableHead, tableBody, 'chefs_bd_dishes');
}

// ---- Order Export ----
export const exportOrdersToPDF = (orders: Order[]) => {
    const tableHead = [['Order ID', 'Date', 'Total (BDT)', 'Status', 'Buyer ID']];
    const tableBody = orders.map(order => [
        order.id?.substring(0, 6),
        order.createdAt ? format(new Date(order.createdAt as string), 'PP') : 'N/A',
        order.total.toFixed(2),
        order.status,
        order.buyerId.substring(0, 10) + '...'
    ]);

    generatePdf('Order List', tableHead, tableBody, 'chefs_bd_orders');
};
