import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InvoicesTable } from "@/components/tables/InvoicesTable";
import { InvoiceViewer } from "@/components/invoices/InvoiceViewer";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { InvoiceGenerator } from "@/components/invoices/InvoiceGenerator";
import { useCustomers } from "@/hooks/useCustomers";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";
import { Plus, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Invoices = () => {
  const { customers } = useCustomers();
  const { purchases } = usePurchases();
  const { invoices, createInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceDialog(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
  };

  const handleInvoiceSubmit = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }
      
      setShowInvoiceDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const customerPurchases = selectedCustomerId 
    ? purchases.filter(p => p.customer_id === selectedCustomerId)
    : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Invoices
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate from Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">All Invoices</h2>
              <p className="text-sm text-muted-foreground">View and manage existing invoices</p>
            </div>
            <Button onClick={handleAddInvoice}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </div>

          <InvoicesTable
            invoices={invoices}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
            onView={(invoice) => {
              setSelectedInvoice(invoice);
              setShowInvoiceViewer(true);
            }}
            onDownload={(invoice) => {
              console.log('Download invoice:', invoice);
            }}
            onSend={(invoice) => {
              console.log('Send invoice:', invoice);
            }}
          />
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Generate Invoice from Purchases</h2>
            <p className="text-sm text-muted-foreground">Select a customer and their purchases to create an invoice</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Choose a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerId && (
              <InvoiceGenerator
                customerId={selectedCustomerId}
                purchases={customerPurchases}
                onInvoiceGenerated={() => {
                  toast({
                    title: "Success",
                    description: "Invoice generated successfully!"
                  });
                }}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            customers={customers}
            onSubmit={handleInvoiceSubmit}
            onCancel={() => setShowInvoiceDialog(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <InvoiceViewer
        invoice={selectedInvoice}
        isOpen={showInvoiceViewer}
        onClose={() => setShowInvoiceViewer(false)}
        onDownload={(invoice) => {
          console.log('Download invoice:', invoice);
        }}
        onSend={(invoice) => {
          console.log('Send invoice:', invoice);
        }}
        onPrint={(invoice) => {
          console.log('Print invoice:', invoice);
          window.print();
        }}
      />
    </div>
  );
};

export default Invoices;