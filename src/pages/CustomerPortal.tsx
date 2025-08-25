import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PurchasesTable } from '@/components/tables/PurchasesTable';
import { CommentSection } from '@/components/customer/CommentSection';
import { Purchase } from '@/types/database';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Download, MessageSquare, LogOut, User } from 'lucide-react';

const CustomerPortal = () => {
  const { customer, logout, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Redirect to customer auth if not logged in
  useEffect(() => {
    if (!authLoading && !customer) {
      navigate('/customer-auth');
    }
  }, [customer, authLoading, navigate]);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!customer) return;

      try {
        const { data: purchasesData, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('customer_id', customer.id)
          .order('purchase_date', { ascending: false });

        if (error) throw error;
        setPurchases(purchasesData || []);
      } catch (error) {
        console.error('Error loading purchases:', error);
        toast({
          title: "Error loading purchases",
          description: "Failed to load your purchase history",
          variant: "destructive"
        });
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [customer, toast]);

  useEffect(() => {
    let filtered = purchases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'last30') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter(purchase => 
        new Date(purchase.purchase_date) >= thirtyDaysAgo
      );
    } else if (dateFilter === 'last90') {
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      filtered = filtered.filter(purchase => 
        new Date(purchase.purchase_date) >= ninetyDaysAgo
      );
    } else if (dateFilter === 'thisYear') {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(purchase => 
        new Date(purchase.purchase_date).getFullYear() === currentYear
      );
    }

    setFilteredPurchases(filtered);
  }, [purchases, searchTerm, dateFilter]);

  const downloadInvoice = async (purchase: Purchase) => {
    try {
      // Generate simple receipt/invoice data
      const invoiceData = {
        purchaseId: purchase.id,
        customerName: customer?.name,
        customerEmail: customer?.email,
        productName: purchase.product_name,
        quantity: purchase.quantity,
        unitPrice: purchase.unit_price,
        totalAmount: purchase.total_amount,
        purchaseDate: purchase.purchase_date,
        notes: purchase.notes
      };

      // Create a simple text receipt
      const receiptText = `
PURCHASE RECEIPT
================

Customer: ${invoiceData.customerName}
Email: ${invoiceData.customerEmail}
Date: ${new Date(invoiceData.purchaseDate).toLocaleDateString()}

Product: ${invoiceData.productName}
Quantity: ${invoiceData.quantity}
Unit Price: $${invoiceData.unitPrice.toFixed(2)}
Total Amount: $${invoiceData.totalAmount.toFixed(2)}

${invoiceData.notes ? `Notes: ${invoiceData.notes}` : ''}

Purchase ID: ${invoiceData.purchaseId}
      `;

      // Download as text file
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${purchase.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Receipt downloaded",
        description: "Your purchase receipt has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download receipt",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with user info and logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {customer.name}</h1>
            <p className="text-muted-foreground">View your complete purchase history and details</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {customer.email}
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredPurchases.length} of {purchases.length} purchases
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Purchases</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-right p-4">Qty</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-right p-4">Total</th>
                    <th className="text-left p-4">Notes</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{purchase.product_name}</td>
                      <td className="p-4">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                      <td className="p-4 text-right">{purchase.quantity}</td>
                      <td className="p-4 text-right">${purchase.unit_price.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium">${purchase.total_amount.toFixed(2)}</td>
                      <td className="p-4 max-w-32 truncate">{purchase.notes || '-'}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadInvoice(purchase)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Receipt
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPurchase(purchase)}
                                className="flex items-center gap-1"
                              >
                                <MessageSquare className="h-3 w-3" />
                                Comment
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Comments & Notes</DialogTitle>
                              </DialogHeader>
                              {selectedPurchase && (
                                <CommentSection
                                  purchaseId={selectedPurchase.id}
                                  productName={selectedPurchase.product_name}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredPurchases.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {searchTerm ? 'No purchases found matching your search.' : 'No purchases recorded yet.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No purchases found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;