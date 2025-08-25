import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomers } from '@/hooks/useCustomers';
import { usePurchases } from '@/hooks/usePurchases';
import { useInvoices } from '@/hooks/useInvoices';
import { Customer, Purchase, Invoice } from '@/types/database';
import { ArrowLeft, Plus, FileText, Mail, Phone, Building, MapPin, ExternalLink } from 'lucide-react';
import PurchaseForm from '@/components/forms/PurchaseForm';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { PurchasesTable } from '@/components/tables/PurchasesTable';
import { InvoicesTable } from '@/components/tables/InvoicesTable';
import { ReportsOverview } from '@/components/reports/ReportsOverview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { purchases, createPurchase, updatePurchase, deletePurchase } = usePurchases(id);
  const { invoices, createInvoice, updateInvoice, deleteInvoice, generateInvoiceFromPurchases } = useInvoices(id);
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const foundCustomer = customers.find(c => c.id === id);
    setCustomer(foundCustomer || null);
  }, [customers, id]);

  const handleCreatePurchase = async (purchaseData: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    const result = await createPurchase(purchaseData);
    if (result) {
      setShowPurchaseForm(false);
    }
    setLoading(false);
  };

  const handleUpdatePurchase = async (purchaseData: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingPurchase) return;
    
    setLoading(true);
    const result = await updatePurchase(editingPurchase.id, purchaseData);
    if (result) {
      setEditingPurchase(null);
    }
    setLoading(false);
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (confirm('Are you sure you want to delete this purchase?')) {
      await deletePurchase(purchaseId);
    }
  };

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    const result = await createInvoice(invoiceData);
    if (result) {
      setShowInvoiceForm(false);
    }
    setLoading(false);
  };

  const handleUpdateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingInvoice) return;
    
    setLoading(true);
    const result = await updateInvoice(editingInvoice.id, invoiceData);
    if (result) {
      setEditingInvoice(null);
    }
    setLoading(false);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(invoiceId);
    }
  };

  const handleGenerateInvoice = async (purchaseIds: string[]) => {
    if (!customer) return;
    
    setLoading(true);
    const result = await generateInvoiceFromPurchases(customer.id, purchaseIds);
    if (result) {
      toast({
        title: "Invoice generated",
        description: `Invoice ${result.invoice_number} has been created successfully.`
      });
    }
    setLoading(false);
  };

  const handleOpenCustomerPortal = () => {
    window.open(`/customer-portal/${customer?.id}`, '_blank');
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total_amount, 0);

  if (!customer) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <p>Customer not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>

        {/* Customer Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={customer.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-foreground">${totalPurchases.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Purchases</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">${totalInvoiced.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Invoiced</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleOpenCustomerPortal}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Customer Portal
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.company}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Purchase History</CardTitle>
                  <Button onClick={() => setShowPurchaseForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Purchase
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PurchasesTable 
                  purchases={purchases}
                  onEdit={setEditingPurchase}
                  onDelete={handleDeletePurchase}
                  onGenerateInvoice={handleGenerateInvoice}
                  showSelection={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Invoices</CardTitle>
                  <Button onClick={() => setShowInvoiceForm(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InvoicesTable 
                  invoices={invoices}
                  onEdit={setEditingInvoice}
                  onDelete={handleDeleteInvoice}
                  onDownload={(invoice) => {
                    toast({
                      title: "Download started",
                      description: `Invoice ${invoice.invoice_number} will be downloaded.`
                    });
                  }}
                  onSend={(invoice) => {
                    toast({
                      title: "Invoice sent",
                      description: `Invoice ${invoice.invoice_number} has been sent to customer.`
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportsOverview 
                  customers={[customer!]}
                  purchases={purchases}
                  invoices={invoices}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Purchase</DialogTitle>
            </DialogHeader>
            <PurchaseForm
              customerId={customer.id}
              onSubmit={handleCreatePurchase}
              onCancel={() => setShowPurchaseForm(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingPurchase} onOpenChange={() => setEditingPurchase(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Purchase</DialogTitle>
            </DialogHeader>
            {editingPurchase && (
              <PurchaseForm
                customerId={customer.id}
                purchase={editingPurchase}
                onSubmit={handleUpdatePurchase}
                onCancel={() => setEditingPurchase(null)}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm
              customers={[{ id: customer.id, name: customer.name }]}
              onSubmit={handleCreateInvoice}
              onCancel={() => setShowInvoiceForm(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            {editingInvoice && (
              <InvoiceForm
                customers={[{ id: customer.id, name: customer.name }]}
                invoice={editingInvoice}
                onSubmit={handleUpdateInvoice}
                onCancel={() => setEditingInvoice(null)}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerDetail;