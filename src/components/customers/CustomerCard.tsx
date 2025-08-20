import { Customer } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Building, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onAddPurchase: (customer: Customer) => void;
}

const CustomerCard = ({ customer, onEdit, onAddPurchase }: CustomerCardProps) => {
  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 shadow-soft hover:shadow-elegant transition-all duration-300 group border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={customer.avatar_url} />
            <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm sm:text-base font-medium">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">{customer.name}</h3>
            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="mt-1">
              {customer.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">{customer.phone}</span>
        </div>
        {customer.company && (
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{customer.company}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm">Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button variant="outline" size="sm" onClick={() => onEdit(customer)} className="w-full sm:w-auto text-xs sm:text-sm">
          Edit
        </Button>
        <Button size="sm" onClick={() => onAddPurchase(customer)} className="w-full sm:w-auto text-xs sm:text-sm">
          Add Purchase
        </Button>
      </div>
    </Card>
  );
};

export default CustomerCard;