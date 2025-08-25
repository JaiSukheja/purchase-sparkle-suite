import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Purchase } from '@/types/database';
import { Edit, Trash2, MoreHorizontal, Search, FileText } from 'lucide-react';

interface PurchasesTableProps {
  purchases: Purchase[];
  onEdit?: (purchase: Purchase) => void;
  onDelete?: (purchaseId: string) => void;
  onGenerateInvoice?: (purchaseIds: string[]) => void;
  showSelection?: boolean;
}

export const PurchasesTable = ({ 
  purchases, 
  onEdit, 
  onDelete, 
  onGenerateInvoice,
  showSelection = false 
}: PurchasesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);

  const filteredPurchases = purchases.filter(purchase =>
    purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (purchaseId: string) => {
    setSelectedPurchases(prev =>
      prev.includes(purchaseId)
        ? prev.filter(id => id !== purchaseId)
        : [...prev, purchaseId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedPurchases(
      selectedPurchases.length === filteredPurchases.length
        ? []
        : filteredPurchases.map(p => p.id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {showSelection && selectedPurchases.length > 0 && onGenerateInvoice && (
          <Button 
            onClick={() => onGenerateInvoice(selectedPurchases)}
            className="ml-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice ({selectedPurchases.length})
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {showSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPurchases.length === filteredPurchases.length && filteredPurchases.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                {showSelection && (
                  <TableCell>
                    <Checkbox
                      checked={selectedPurchases.includes(purchase.id)}
                      onCheckedChange={() => toggleSelection(purchase.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{purchase.product_name}</TableCell>
                <TableCell>{new Date(purchase.purchase_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">{purchase.quantity}</TableCell>
                <TableCell className="text-right">${purchase.unit_price.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">${purchase.total_amount.toFixed(2)}</TableCell>
                <TableCell className="max-w-32 truncate">{purchase.notes || '-'}</TableCell>
                <TableCell className="text-right">
                  {(onEdit || onDelete) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(purchase)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(purchase.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground text-sm">Read only</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredPurchases.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? 'No purchases found matching your search.' : 'No purchases recorded yet.'}
          </div>
        )}
      </div>
    </div>
  );
};