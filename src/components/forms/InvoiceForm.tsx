import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Invoice } from '@/types/database';

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.date(),
  due_date: z.date().optional(),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_amount: z.number().min(0, 'Tax amount must be positive'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice | null;
  customers: Array<{id: string; name: string}>;
  onSubmit: (data: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const InvoiceForm = ({ invoice, customers, onSubmit, onCancel, loading }: InvoiceFormProps) => {
  const [subtotal, setSubtotal] = useState(invoice?.subtotal || 0);
  const [taxRate, setTaxRate] = useState(0.1); // 10% default tax rate

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: invoice?.customer_id || '',
      invoice_number: invoice?.invoice_number || `INV-${Date.now()}`,
      invoice_date: invoice ? new Date(invoice.invoice_date) : new Date(),
      due_date: invoice?.due_date ? new Date(invoice.due_date) : undefined,
      subtotal: invoice?.subtotal || 0,
      tax_amount: invoice?.tax_amount || 0,
      total_amount: invoice?.total_amount || 0,
      status: invoice?.status || 'draft',
      notes: invoice?.notes || '',
    },
  });

  const watchSubtotal = form.watch('subtotal');

  useEffect(() => {
    const taxAmount = watchSubtotal * taxRate;
    const totalAmount = watchSubtotal + taxAmount;
    
    form.setValue('tax_amount', Number(taxAmount.toFixed(2)));
    form.setValue('total_amount', Number(totalAmount.toFixed(2)));
  }, [watchSubtotal, taxRate, form]);

  const handleSubmit = async (data: InvoiceFormData) => {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Invoice Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtotal</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes for this invoice..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InvoiceForm;