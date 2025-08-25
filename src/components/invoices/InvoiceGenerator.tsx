import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Purchase } from "@/types/database";
import { useInvoices } from "@/hooks/useInvoices";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Loader2 } from "lucide-react";

interface InvoiceGeneratorProps {
  customerId: string;
  purchases: Purchase[];
  onInvoiceGenerated?: () => void;
}

export const InvoiceGenerator = ({ customerId, purchases, onInvoiceGenerated }: InvoiceGeneratorProps) => {
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { generateInvoiceFromPurchases } = useInvoices();
  const { toast } = useToast();

  const handleSelectPurchase = (purchaseId: string, checked: boolean) => {
    if (checked) {
      setSelectedPurchases(prev => [...prev, purchaseId]);
    } else {
      setSelectedPurchases(prev => prev.filter(id => id !== purchaseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPurchases(purchases.map(p => p.id));
    } else {
      setSelectedPurchases([]);
    }
  };

  const handleGenerateInvoice = async () => {
    if (selectedPurchases.length === 0) {
      toast({
        title: "No purchases selected",
        description: "Please select at least one purchase to generate an invoice.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const invoice = await generateInvoiceFromPurchases(customerId, selectedPurchases);
      if (invoice) {
        toast({
          title: "Invoice generated successfully",
          description: `Invoice ${invoice.invoice_number} has been created.`
        });
        setSelectedPurchases([]);
        onInvoiceGenerated?.();
      }
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTotal = purchases
    .filter(p => selectedPurchases.includes(p.id))
    .reduce((sum, p) => sum + p.total_amount, 0);

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No purchases available to invoice</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generate Invoice from Purchases</CardTitle>
          <Button 
            onClick={handleGenerateInvoice} 
            disabled={selectedPurchases.length === 0 || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Invoice
          </Button>
        </div>
        {selectedPurchases.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedPurchases.length} purchase(s) selected • Total: ${selectedTotal.toFixed(2)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedPurchases.length === purchases.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product/Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPurchases.includes(purchase.id)}
                      onCheckedChange={(checked) => handleSelectPurchase(purchase.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {purchase.product_name}
                    {purchase.notes && (
                      <div className="text-sm text-muted-foreground">
                        {purchase.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ${purchase.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${purchase.total_amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};