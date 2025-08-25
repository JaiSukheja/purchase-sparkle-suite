import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PurchasesTable } from '@/components/tables/PurchasesTable';
import { Purchase } from '@/types/database';
import { Search, Filter } from 'lucide-react';

const CustomerPortal = () => {
  const { customerId } = useParams<{ customerId: string }>();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!customerId) return;

      try {
        // Fetch purchases without authentication - public access
        const { data: purchasesData, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('customer_id', customerId)
          .order('purchase_date', { ascending: false });

        if (error) throw error;
        setPurchases(purchasesData || []);
      } catch (error) {
        console.error('Error loading purchases:', error);
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [customerId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Purchase History</h1>
          <p className="text-muted-foreground">View your complete purchase history and details</p>
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
          <CardContent className="p-0">
            <PurchasesTable 
              purchases={filteredPurchases}
              onEdit={() => {}} // Read-only for public access
              onDelete={() => {}} // Read-only for public access
            />
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