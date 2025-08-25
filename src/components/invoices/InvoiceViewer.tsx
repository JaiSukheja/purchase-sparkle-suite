import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/database";
import { Download, Send, Printer, X } from "lucide-react";

interface InvoiceViewerProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onPrint?: (invoice: Invoice) => void;
}

export const InvoiceViewer = ({ 
  invoice, 
  isOpen, 
  onClose, 
  onDownload, 
  onSend, 
  onPrint 
}: InvoiceViewerProps) => {
  if (!invoice) return null;

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-muted text-foreground';
      case 'sent':
        return 'bg-muted text-foreground';
      case 'overdue':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">
            Invoice #{invoice.invoice_number}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(invoice.status)} border-0`}>
              {invoice.status.toUpperCase()}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {onDownload && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownload(invoice)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
            {onSend && invoice.status === 'draft' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSend(invoice)}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
            )}
            {onPrint && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onPrint(invoice)}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
          </div>

          {/* Invoice Preview */}
          <Card className="bg-background border shadow-sm">
            <CardHeader className="bg-muted/50 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">INVOICE</h1>
                  <p className="text-muted-foreground">#{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-foreground">Your Company Name</h2>
                  <p className="text-muted-foreground">123 Business Street</p>
                  <p className="text-muted-foreground">City, State 12345</p>
                  <p className="text-muted-foreground">contact@company.com</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-foreground">Bill To:</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-medium">[Customer Name]</p>
                    <p>[Customer Address]</p>
                    <p>[City, State ZIP]</p>
                    <p>[Customer Email]</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Invoice Date</p>
                      <p className="text-foreground">{formatDate(invoice.invoice_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className="text-foreground">
                        {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {invoice.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-foreground">{invoice.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-foreground">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Qty</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Rate</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample items - replace with actual invoice items */}
                      <tr className="border-b border-border">
                        <td className="py-3 px-2 text-foreground">Sample Service</td>
                        <td className="py-3 px-2 text-right text-foreground">1</td>
                        <td className="py-3 px-2 text-right text-foreground">$100.00</td>
                        <td className="py-3 px-2 text-right text-foreground">$100.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span>${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total:</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Payment Terms</h4>
                <p className="text-sm text-muted-foreground">
                  Payment is due within 30 days of the invoice date. Late payments may be subject to fees.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};