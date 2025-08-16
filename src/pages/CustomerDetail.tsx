import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomers } from '@/hooks/useCustomers';
import { usePurchases } from '@/hooks/usePurchases';
import { Customer, Purchase } from '@/types/database';
import { ArrowLeft, Plus, Edit, Trash2, Mail, Phone, Building, MapPin } from 'lucide-react';
import PurchaseForm from '@/components/forms/PurchaseForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { purchases, createPurchase, updatePurchase, deletePurchase } = usePurchases(id);
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
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

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total_amount, 0);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-primary p-4">
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
    <div className="min-h-screen bg-gradient-primary p-4">
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
        <Card className="bg-glass shadow-elegant">
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
                  <div className="text-sm text-muted-foreground">
                    <p className="text-2xl font-bold text-foreground">${totalPurchases.toLocaleString()}</p>
                    <p>Total Purchases</p>
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Purchase History</h2>
              <Button onClick={() => setShowPurchaseForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </div>

            <div className="grid gap-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="bg-glass shadow-soft hover:shadow-elegant transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{purchase.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {purchase.quantity} × ${purchase.unit_price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </p>
                        {purchase.notes && (
                          <p className="text-xs text-muted-foreground italic">{purchase.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">${purchase.total_amount.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPurchase(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {purchases.length === 0 && (
                <Card className="bg-glass">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No purchases recorded yet</p>
                    <Button 
                      onClick={() => setShowPurchaseForm(true)}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Purchase
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="bg-glass">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Invoice management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-glass">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Reports and analytics coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Form Dialogs */}
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
    </div>
  );
};

export default CustomerDetail;