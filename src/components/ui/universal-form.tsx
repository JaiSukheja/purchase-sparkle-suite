import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UniversalFormProps, FormFieldConfig, FormSection } from '@/types/form-config';

const UniversalForm = <T extends Record<string, any>>({
  config,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  className
}: UniversalFormProps<T>) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const form = useForm({
    resolver: config.validationSchema ? zodResolver(config.validationSchema) : undefined,
    defaultValues: initialData,
  });

  // Update form when initialData changes
  useEffect(() => {
    setFormData(initialData);
    form.reset(initialData);
  }, [initialData, form]);

  const handleFieldChange = (fieldConfig: FormFieldConfig, value: any) => {
    const newFormData = { ...formData, [fieldConfig.name]: value };
    setFormData(newFormData);

    // Handle field dependencies and onChange callbacks
    if (fieldConfig.onChange) {
      const updates = fieldConfig.onChange(value, newFormData);
      if (updates) {
        Object.entries(updates).forEach(([key, updateValue]) => {
          form.setValue(key, updateValue);
          newFormData[key] = updateValue;
        });
        setFormData(newFormData);
      }
    }
  };

  const renderField = (fieldConfig: FormFieldConfig) => {
    const { name, label, type, placeholder, required, disabled, readonly, options, validation, description } = fieldConfig;

    // Check if field should be shown based on conditions
    if (fieldConfig.condition && !fieldConfig.condition(formData[fieldConfig.dependsOn || ''])) {
      return null;
    }

    const commonProps = {
      disabled,
      readOnly: readonly,
      placeholder,
      required,
      ...validation,
    };

    if (config.validationSchema) {
      return (
        <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className={fieldConfig.gridColumn || ''}>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                {renderFieldControl(fieldConfig, field, commonProps)}
              </FormControl>
              {description && <FormDescription>{description}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    // Fallback for forms without validation schema
    return (
      <div key={name} className={`space-y-2 ${fieldConfig.gridColumn || ''}`}>
        <Label htmlFor={name}>{label}</Label>
        {renderFieldControlFallback(fieldConfig, commonProps)}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    );
  };

  const renderFieldControl = (fieldConfig: FormFieldConfig, field: any, commonProps: any) => {
    const { type, options } = fieldConfig;

    switch (type) {
      case 'select':
        return (
          <Select onValueChange={(value) => {
            field.onChange(value);
            handleFieldChange(fieldConfig, value);
          }} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={commonProps.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            {...field}
            {...commonProps}
            onChange={(e) => {
              field.onChange(e);
              handleFieldChange(fieldConfig, e.target.value);
            }}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              handleFieldChange(fieldConfig, checked);
            }}
            disabled={commonProps.disabled}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${fieldConfig.name}-${option.value}`}
                  name={fieldConfig.name}
                  value={String(option.value)}
                  checked={field.value === option.value}
                  onChange={() => {
                    field.onChange(option.value);
                    handleFieldChange(fieldConfig, option.value);
                  }}
                  disabled={option.disabled}
                />
                <Label htmlFor={`${fieldConfig.name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'datepicker':
        return (
          <Popover>
            <PopoverTrigger asChild>
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
                  <span>{commonProps.placeholder || "Pick a date"}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  field.onChange(date);
                  handleFieldChange(fieldConfig, date);
                }}
                disabled={(date) =>
                  commonProps.disabled || (commonProps.min && date < new Date(commonProps.min)) ||
                  (commonProps.max && date > new Date(commonProps.max))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'number':
        return (
          <Input
            {...field}
            {...commonProps}
            type="number"
            onChange={(e) => {
              const value = e.target.value === '' ? '' : Number(e.target.value);
              field.onChange(value);
              handleFieldChange(fieldConfig, value);
            }}
          />
        );

      default:
        return (
          <Input
            {...field}
            {...commonProps}
            type={type}
            onChange={(e) => {
              field.onChange(e);
              handleFieldChange(fieldConfig, e.target.value);
            }}
          />
        );
    }
  };

  const renderFieldControlFallback = (fieldConfig: FormFieldConfig, commonProps: any) => {
    const { name, type, options } = fieldConfig;
    const value = formData[name] || fieldConfig.defaultValue || '';

    switch (type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(value) => handleFieldChange(fieldConfig, value)}>
            <SelectTrigger>
              <SelectValue placeholder={commonProps.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            id={name}
            value={value}
            onChange={(e) => handleFieldChange(fieldConfig, e.target.value)}
            {...commonProps}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            id={name}
            checked={value}
            onCheckedChange={(checked) => handleFieldChange(fieldConfig, checked)}
            disabled={commonProps.disabled}
          />
        );

      case 'number':
        return (
          <Input
            id={name}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldConfig, e.target.value === '' ? '' : Number(e.target.value))}
            {...commonProps}
          />
        );

      default:
        return (
          <Input
            id={name}
            type={type}
            value={value}
            onChange={(e) => handleFieldChange(fieldConfig, e.target.value)}
            {...commonProps}
          />
        );
    }
  };

  const renderSection = (section: FormSection, index: number) => (
    <div key={index} className="space-y-4">
      {section.title && (
        <div>
          <h3 className="text-lg font-medium">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      )}
      <div className={`grid gap-4 ${section.gridColumns || 'grid-cols-1 md:grid-cols-2'}`}>
        {section.fields.map(renderField)}
      </div>
    </div>
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (config.validationSchema) {
      // Use react-hook-form validation
      form.handleSubmit(async (data) => {
        await onSubmit(data as T);
      })();
    } else {
      // Simple form submission
      await onSubmit(formData as T);
    }
  };

  const formContent = (
    <div className="space-y-6">
      {config.sections.map(renderSection)}
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1" onClick={handleSubmit}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {config.submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {config.cancelLabel || 'Cancel'}
          </Button>
        )}
      </div>
    </div>
  );

  if (config.validationSchema) {
    const wrappedContent = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data as T))}>
          {formContent}
        </form>
      </Form>
    );

    if (config.showCard !== false) {
      return (
        <Card className={cn("w-full max-w-2xl mx-auto bg-glass shadow-elegant", className)}>
          <CardHeader>
            <CardTitle>{config.title}</CardTitle>
            {config.description && (
              <p className="text-sm text-muted-foreground">{config.description}</p>
            )}
          </CardHeader>
          <CardContent>{wrappedContent}</CardContent>
        </Card>
      );
    }

    return <div className={className}>{wrappedContent}</div>;
  }

  // Simple form without validation
  const simpleFormContent = (
    <form onSubmit={handleSubmit}>
      {formContent}
    </form>
  );

  if (config.showCard !== false) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto bg-glass shadow-elegant", className)}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </CardHeader>
        <CardContent>{simpleFormContent}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{simpleFormContent}</div>;
};

export default UniversalForm;