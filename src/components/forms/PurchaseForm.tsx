import { useMemo } from 'react';
import UniversalForm from '@/components/ui/universal-form';
import { purchaseFormConfig } from '@/config/form-configs';
import { Purchase } from '@/types/database';
import { useCustomers } from '@/hooks/useCustomers';

interface PurchaseFormProps {
  customerId?: string;
  purchase?: Purchase | null;
  onSubmit: (data: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PurchaseForm = ({ customerId, purchase, onSubmit, onCancel, loading = false }: PurchaseFormProps) => {
  const { customers } = useCustomers();

  const config = useMemo(() => {
    const configCopy = JSON.parse(JSON.stringify(purchaseFormConfig));
    
    // Update customer options
    const customerField = configCopy.sections[0].fields.find(f => f.name === 'customer_id');
    if (customerField) {
      customerField.options = customers.map(customer => ({
        value: customer.id,
        label: `${customer.name} - ${customer.email}`,
      }));
      
      // Hide customer field if customerId is provided
      if (customerId) {
        customerField.condition = () => false;
      }
    }

    return {
      ...configCopy,
      title: purchase ? 'Edit Purchase' : 'Add New Purchase',
      submitLabel: purchase ? 'Update Purchase' : 'Create Purchase',
    };
  }, [customers, customerId, purchase]);

  const initialData = useMemo(() => {
    if (purchase) return purchase;
    
    return {
      customer_id: customerId || '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total_amount: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: '',
    };
  }, [customerId, purchase]);

  return (
    <UniversalForm
      config={config}
      initialData={initialData}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
    />
  );
};

export default PurchaseForm;