import { useMemo } from 'react';
import UniversalForm from '@/components/ui/universal-form';
import { invoiceFormConfig } from '@/config/form-configs';
import { Invoice } from '@/types/database';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  customers: Array<{id: string; name: string}>;
  onSubmit: (data: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const InvoiceForm = ({ invoice, customers, onSubmit, onCancel, loading }: InvoiceFormProps) => {
  const config = useMemo(() => {
    const configCopy = JSON.parse(JSON.stringify(invoiceFormConfig));
    
    // Update customer options
    const customerField = configCopy.sections[0].fields.find(f => f.name === 'customer_id');
    if (customerField) {
      customerField.options = customers.map(customer => ({
        value: customer.id,
        label: customer.name,
      }));
    }

    return {
      ...configCopy,
      title: invoice ? 'Edit Invoice' : 'Create Invoice',
      submitLabel: invoice ? 'Update Invoice' : 'Create Invoice',
    };
  }, [customers, invoice]);

  const initialData = useMemo(() => {
    if (invoice) {
      return {
        ...invoice,
        invoice_date: new Date(invoice.invoice_date),
        due_date: invoice.due_date ? new Date(invoice.due_date) : undefined,
      };
    }
    
    return {
      customer_id: '',
      invoice_number: `INV-${Date.now()}`,
      invoice_date: new Date(),
      due_date: undefined,
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'draft' as const,
      notes: '',
    };
  }, [invoice]);

  const handleSubmit = async (data: any) => {
    await onSubmit({
      customer_id: data.customer_id,
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date.toISOString(),
      due_date: data.due_date?.toISOString(),
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      total_amount: data.total_amount,
      status: data.status,
      notes: data.notes,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <UniversalForm
        config={config}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        loading={loading}
      />
    </div>
  );
};

export default InvoiceForm;