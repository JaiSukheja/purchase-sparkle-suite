import UniversalForm from '@/components/ui/universal-form';
import { customerFormConfig } from '@/config/form-configs';
import { Customer } from '@/types/database';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CustomerForm = ({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) => {
  const config = {
    ...customerFormConfig,
    title: customer ? 'Edit Customer' : 'Add New Customer',
    submitLabel: customer ? 'Update Customer' : 'Create Customer',
  };

  return (
    <UniversalForm
      config={config}
      initialData={customer || {}}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
    />
  );
};

export default CustomerForm;