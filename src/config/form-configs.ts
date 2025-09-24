import * as z from 'zod';
import { FormConfig } from '@/types/form-config';

// Customer Form Configuration
export const customerFormConfig: FormConfig = {
  title: 'Customer Information',
  description: 'Enter customer details',
  submitLabel: 'Save Customer',
  sections: [
    {
      title: 'Basic Information',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          placeholder: 'Enter customer name',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'Enter email address',
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          required: true,
          placeholder: 'Enter phone number',
        },
        {
          name: 'company',
          label: 'Company',
          type: 'text',
          placeholder: 'Enter company name',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'active',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
        {
          name: 'avatar_url',
          label: 'Avatar URL',
          type: 'url',
          placeholder: 'Enter avatar image URL',
        },
      ],
    },
    {
      title: 'Address',
      fields: [
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          placeholder: 'Enter full address',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

// Purchase Form Configuration
export const purchaseFormConfig: FormConfig = {
  title: 'Purchase Information',
  description: 'Enter purchase details',
  submitLabel: 'Save Purchase',
  sections: [
    {
      title: 'Purchase Details',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          placeholder: 'Select a customer',
          options: [], // Will be populated dynamically
        },
        {
          name: 'product_name',
          label: 'Product/Service',
          type: 'text',
          required: true,
          placeholder: 'Enter product or service name',
          gridColumn: 'md:col-span-2',
        },
        {
          name: 'quantity',
          label: 'Quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          validation: { min: 1 },
          placeholder: 'Enter quantity',
          onChange: (value, formData) => ({
            total_amount: (value || 0) * (formData.unit_price || 0),
          }),
        },
        {
          name: 'unit_price',
          label: 'Unit Price',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: 'Enter unit price',
          onChange: (value, formData) => ({
            total_amount: (formData.quantity || 0) * (value || 0),
          }),
        },
        {
          name: 'total_amount',
          label: 'Total Amount',
          type: 'number',
          readonly: true,
          validation: { step: 0.01 },
        },
        {
          name: 'purchase_date',
          label: 'Purchase Date',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString().split('T')[0],
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'notes',
          label: 'Notes',
          type: 'textarea',
          placeholder: 'Enter any additional notes',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

// Invoice Form Configuration with Zod validation
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

export const invoiceFormConfig: FormConfig = {
  title: 'Invoice Information',
  description: 'Create or edit invoice details',
  submitLabel: 'Save Invoice',
  validationSchema: invoiceSchema,
  sections: [
    {
      title: 'Basic Information',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'customer_id',
          label: 'Customer',
          type: 'select',
          required: true,
          placeholder: 'Select a customer',
          options: [], // Will be populated dynamically
        },
        {
          name: 'invoice_number',
          label: 'Invoice Number',
          type: 'text',
          required: true,
          placeholder: 'INV-001',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          defaultValue: 'draft',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'paid', label: 'Paid' },
            { value: 'overdue', label: 'Overdue' },
          ],
        },
        {
          name: 'invoice_date',
          label: 'Invoice Date',
          type: 'datepicker',
          required: true,
          defaultValue: new Date(),
        },
        {
          name: 'due_date',
          label: 'Due Date (Optional)',
          type: 'datepicker',
          description: 'Optional due date for payment',
        },
      ],
    },
    {
      title: 'Financial Details',
      gridColumns: 'grid-cols-1 md:grid-cols-3',
      fields: [
        {
          name: 'subtotal',
          label: 'Subtotal',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: '0.00',
          onChange: (value, formData) => {
            const taxRate = 0.1; // 10% default tax rate
            const taxAmount = (value || 0) * taxRate;
            const totalAmount = (value || 0) + taxAmount;
            return {
              tax_amount: Number(taxAmount.toFixed(2)),
              total_amount: Number(totalAmount.toFixed(2)),
            };
          },
        },
        {
          name: 'tax_amount',
          label: 'Tax Amount',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: '0.00',
        },
        {
          name: 'total_amount',
          label: 'Total Amount',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: '0.00',
          disabled: true,
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'notes',
          label: 'Notes (Optional)',
          type: 'textarea',
          placeholder: 'Additional notes for this invoice...',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

// Organization Form Configuration
export const organizationFormConfig: FormConfig = {
  title: 'Organization Information',
  description: 'Enter organization details',
  submitLabel: 'Save Organization',
  sections: [
    {
      fields: [
        {
          name: 'name',
          label: 'Organization Name',
          type: 'text',
          required: true,
          placeholder: 'Enter organization name',
          gridColumn: 'md:col-span-2',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Enter organization description',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

// Coupon Form Configuration
export const couponFormConfig: FormConfig = {
  title: 'Coupon Information',
  description: 'Create or edit coupon details',
  submitLabel: 'Save Coupon',
  sections: [
    {
      title: 'Basic Information',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'code',
          label: 'Coupon Code',
          type: 'text',
          required: true,
          placeholder: 'Enter coupon code',
        },
        {
          name: 'discount_type',
          label: 'Discount Type',
          type: 'select',
          required: true,
          options: [
            { value: 'fixed', label: 'Fixed Amount' },
            { value: 'percentage', label: 'Percentage' },
          ],
        },
        {
          name: 'discount_value',
          label: 'Discount Value',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: 'Enter discount value',
        },
        {
          name: 'max_uses',
          label: 'Maximum Uses',
          type: 'number',
          validation: { min: 1 },
          placeholder: 'Enter maximum uses',
        },
        {
          name: 'expires_at',
          label: 'Expiry Date',
          type: 'datepicker',
          placeholder: 'Select expiry date',
        },
        {
          name: 'is_active',
          label: 'Active',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
};