import { Customer } from "@/types/customer";
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
    <Card className="p-6 bg-gradient-card shadow-soft hover:shadow-elegant transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{customer.name}</h3>
            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
              {customer.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>{customer.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{customer.phone}</span>
        </div>
        {customer.company && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>{customer.company}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">${customer.totalPurchases.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
          Edit
        </Button>
        <Button size="sm" onClick={() => onAddPurchase(customer)}>
          Add Purchase
        </Button>
      </div>
    </Card>
  );
};

export default CustomerCard;