import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Purchase } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface PurchaseFormProps {
  customerId: string;
  purchase?: Purchase | null;
  onSubmit: (data: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PurchaseForm = ({ customerId, purchase, onSubmit, onCancel, loading = false }: PurchaseFormProps) => {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    product_name: purchase?.product_name || '',
    quantity: purchase?.quantity || 1,
    unit_price: purchase?.unit_price || 0,
    total_amount: purchase?.total_amount || 0,
    purchase_date: purchase?.purchase_date || new Date().toISOString().split('T')[0],
    notes: purchase?.notes || ''
  });

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      total_amount: calculateTotal(formData.quantity, formData.unit_price)
    });
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      quantity,
      total_amount: calculateTotal(quantity, prev.unit_price)
    }));
  };

  const handleUnitPriceChange = (value: string) => {
    const unitPrice = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      unit_price: unitPrice,
      total_amount: calculateTotal(prev.quantity, unitPrice)
    }));
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-glass shadow-elegant">
      <CardHeader>
        <CardTitle>{purchase ? 'Edit Purchase' : 'Add New Purchase'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product_name">Product/Service Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                required
                placeholder="Enter product or service name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                required
                placeholder="Enter unit price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleChange('purchase_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {purchase ? 'Update Purchase' : 'Create Purchase'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PurchaseForm;