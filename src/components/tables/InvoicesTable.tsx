import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types/database';
import { Edit, Trash2, MoreHorizontal, Download, Send, Search, Eye } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
  onView?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
}

const getStatusVariant = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'sent':
      return 'secondary';
    case 'overdue':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const InvoicesTable = ({ 
  invoices, 
  onEdit, 
  onDelete,
  onView,
  onDownload,
  onSend
}: InvoicesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell className="text-right">${invoice.subtotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">${invoice.tax_amount.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(invoice)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                      )}
                      {onSend && invoice.status === 'draft' && (
                        <DropdownMenuItem onClick={() => onSend(invoice)}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Invoice
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDelete(invoice.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No invoices found matching your search.' : 'No invoices created yet.'}
          </div>
        )}
      </div>
    </div>
  );
};