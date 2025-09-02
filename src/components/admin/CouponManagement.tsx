import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Tag, Percent, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

interface CouponForm {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  expires_at: string;
  is_active: boolean;
}

const defaultCouponForm: CouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  max_uses: 100,
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: true
};

export const CouponManagement = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponForm>(defaultCouponForm);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data || []).map(coupon => ({
        ...coupon,
        discount_type: coupon.discount_type as 'percentage' | 'fixed'
      })));
    } catch (error: any) {
      toast({
        title: "Error loading coupons",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: couponForm.code,
          discount_type: couponForm.discount_type,
          discount_value: couponForm.discount_value,
          max_uses: couponForm.max_uses,
          expires_at: couponForm.expires_at,
          is_active: couponForm.is_active,
          current_uses: 0,
          created_by: 'admin'
        }]);

      if (error) throw error;

      await fetchCoupons();
      setIsSheetOpen(false);
      setCouponForm(defaultCouponForm);
      toast({
        title: "Coupon created",
        description: "New coupon has been added successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error creating coupon",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          code: couponForm.code,
          discount_type: couponForm.discount_type,
          discount_value: couponForm.discount_value,
          max_uses: couponForm.max_uses,
          expires_at: couponForm.expires_at,
          is_active: couponForm.is_active
        })
        .eq('id', selectedCoupon.id);

      if (error) throw error;

      await fetchCoupons();
      setIsSheetOpen(false);
      toast({
        title: "Coupon updated",
        description: "Coupon details have been saved"
      });
    } catch (error: any) {
      toast({
        title: "Error updating coupon",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      await fetchCoupons();
      toast({
        title: "Coupon deleted",
        description: "Coupon has been removed from the system"
      });
    } catch (error: any) {
      toast({
        title: "Error deleting coupon",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openCreateDialog = () => {
    setSelectedCoupon(null);
    setIsCreateMode(true);
    setCouponForm(defaultCouponForm);
    setIsSheetOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsCreateMode(false);
    setCouponForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_uses: coupon.max_uses,
      expires_at: coupon.expires_at.split('T')[0],
      is_active: coupon.is_active
    });
    setIsSheetOpen(true);
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.is_active) return 'destructive';
    if (new Date(coupon.expires_at) < new Date()) return 'secondary';
    if (coupon.current_uses >= coupon.max_uses) return 'outline';
    return 'default';
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.is_active) return 'Inactive';
    if (new Date(coupon.expires_at) < new Date()) return 'Expired';
    if (coupon.current_uses >= coupon.max_uses) return 'Used Up';
    return 'Active';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading coupons...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Coupons</p>
                <p className="text-2xl font-bold">
                  {coupons.filter(c => c.is_active && new Date(c.expires_at) > new Date()).length}
                </p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">
                  {coupons.filter(c => new Date(c.expires_at) < new Date()).length}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage discount coupons</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Code</TableHead>
                  <TableHead className="hidden sm:table-cell">Type & Value</TableHead>
                  <TableHead className="hidden md:table-cell">Usage</TableHead>
                  <TableHead className="hidden lg:table-cell">Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono font-medium">{coupon.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {coupon.discount_type} discount
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden sm:table-cell">
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {coupon.current_uses} / {coupon.max_uses}
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full" 
                            style={{ 
                              width: `${Math.min((coupon.current_uses / coupon.max_uses) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">
                        {new Date(coupon.expires_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusColor(coupon)}>
                        {getStatusText(coupon)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {isCreateMode ? 'Create New Coupon' : 'Edit Coupon'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="DISCOUNT20"
                  className="mt-2 font-mono"
                />
              </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_type">Discount Type</Label>
                    <Select 
                      value={couponForm.discount_type} 
                      onValueChange={(value: 'percentage' | 'fixed') => 
                        setCouponForm(prev => ({ ...prev, discount_type: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="discount_value">
                      Value {couponForm.discount_type === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={couponForm.discount_value}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                      className="mt-2"
                      min="0"
                      max={couponForm.discount_type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                </div>
              
              
              <div>
                <Label htmlFor="max_uses">Maximum Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={couponForm.max_uses}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, max_uses: Number(e.target.value) }))}
                  className="mt-2"
                  min="1"
                />
              </div>
              
                <div>
                  <Label htmlFor="expires_at">Expires At</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={couponForm.expires_at.split('T')[0]}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={couponForm.is_active}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            
            <Button 
              onClick={isCreateMode ? createCoupon : updateCoupon}
              disabled={!couponForm.code || !couponForm.discount_value}
              className="w-full"
            >
              {isCreateMode ? 'Create Coupon' : 'Save Changes'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};