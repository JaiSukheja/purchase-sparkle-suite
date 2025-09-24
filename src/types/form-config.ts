export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'datetime-local'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio'
  | 'datepicker'
  | 'file';

export interface FormSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    step?: number;
  };
  options?: FormSelectOption[]; // For select, radio, checkbox fields
  dependsOn?: string; // Field name that this field depends on
  condition?: (value: any) => boolean; // Condition to show this field
  gridColumn?: string; // CSS grid column span (e.g., "md:col-span-2")
  description?: string;
  defaultValue?: any;
  onChange?: (value: any, formData: Record<string, any>) => Partial<Record<string, any>>; // Returns updates to other fields
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  gridColumns?: string; // CSS grid class (e.g., "grid-cols-1 md:grid-cols-2")
}

export interface FormConfig {
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel: string;
  cancelLabel?: string;
  showCard?: boolean;
  validationSchema?: any; // Zod schema
}

export interface UniversalFormProps<T = Record<string, any>> {
  config: FormConfig;
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}