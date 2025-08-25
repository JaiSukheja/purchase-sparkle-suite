import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/types/database';
import { Edit, Trash2, MoreHorizontal, Eye, Search } from 'lucide-react';

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export const CustomersTable = ({ customers, onEdit, onDelete }: CustomersTableProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow 
                key={customer.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleView(customer.id)}
              >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={customer.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.company || '-'}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleView(customer.id);
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(customer);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(customer.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredCustomers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No customers found matching your search.' : 'No customers yet.'}
          </div>
        )}
      </div>
    </div>
  );
};