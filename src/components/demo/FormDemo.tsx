import { useState } from 'react';
import UniversalForm from '@/components/ui/universal-form';
import { FormConfig } from '@/types/form-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Demo form configurations
const contactFormConfig: FormConfig = {
  title: 'Contact Information',
  description: 'Fill out your contact details',
  submitLabel: 'Save Contact',
  sections: [
    {
      title: 'Personal Information',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your first name',
        },
        {
          name: 'lastName',
          label: 'Last Name',
          type: 'text',
          required: true,
          placeholder: 'Enter your last name',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'Enter your email',
        },
        {
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          placeholder: 'Enter your phone number',
        },
        {
          name: 'website',
          label: 'Website',
          type: 'url',
          placeholder: 'https://example.com',
        },
        {
          name: 'birthDate',
          label: 'Birth Date',
          type: 'date',
        },
      ],
    },
    {
      title: 'Preferences',
      fields: [
        {
          name: 'contactMethod',
          label: 'Preferred Contact Method',
          type: 'select',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'sms', label: 'SMS' },
          ],
        },
        {
          name: 'newsletter',
          label: 'Subscribe to Newsletter',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'notes',
          label: 'Additional Notes',
          type: 'textarea',
          placeholder: 'Any additional information...',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

const productFormConfig: FormConfig = {
  title: 'Product Information',
  description: 'Add a new product to inventory',
  submitLabel: 'Add Product',
  sections: [
    {
      title: 'Basic Details',
      gridColumns: 'grid-cols-1 md:grid-cols-2',
      fields: [
        {
          name: 'name',
          label: 'Product Name',
          type: 'text',
          required: true,
          placeholder: 'Enter product name',
        },
        {
          name: 'sku',
          label: 'SKU',
          type: 'text',
          required: true,
          placeholder: 'Enter SKU',
        },
        {
          name: 'price',
          label: 'Price',
          type: 'number',
          required: true,
          validation: { min: 0, step: 0.01 },
          placeholder: '0.00',
        },
        {
          name: 'quantity',
          label: 'Quantity',
          type: 'number',
          required: true,
          validation: { min: 0 },
          defaultValue: 1,
          onChange: (value, formData) => {
            const price = formData.price || 0;
            return {
              totalValue: (value || 0) * price,
            };
          },
        },
        {
          name: 'totalValue',
          label: 'Total Value',
          type: 'number',
          readonly: true,
          validation: { step: 0.01 },
        },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { value: 'electronics', label: 'Electronics' },
            { value: 'clothing', label: 'Clothing' },
            { value: 'books', label: 'Books' },
            { value: 'home', label: 'Home & Garden' },
          ],
        },
      ],
    },
    {
      title: 'Description',
      fields: [
        {
          name: 'description',
          label: 'Product Description',
          type: 'textarea',
          placeholder: 'Describe the product...',
          gridColumn: 'md:col-span-2',
        },
      ],
    },
  ],
};

export const FormDemo = () => {
  const [activeForm, setActiveForm] = useState<'contact' | 'product' | null>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
    setActiveForm(null);
  };

  const handleCancel = () => {
    setActiveForm(null);
  };

  if (activeForm === 'contact') {
    return (
      <UniversalForm
        config={contactFormConfig}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  if (activeForm === 'product') {
    return (
      <UniversalForm
        config={productFormConfig}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Universal Form System Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            This demonstrates how forms are now generated from JSON configuration instead of hardcoded components.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={() => setActiveForm('contact')} size="lg">
              Contact Form
            </Button>
            <Button onClick={() => setActiveForm('product')} size="lg" variant="outline">
              Product Form
            </Button>
          </div>

          {submittedData && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Last Submitted Data:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};