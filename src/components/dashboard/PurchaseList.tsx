import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Edit, Trash2, Package, MoreHorizontal } from "lucide-react";
import { Purchase } from "@/types/database";
import { usePurchases } from "@/hooks/usePurchases";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PurchaseForm from "../forms/PurchaseForm";
import { useToast } from "@/components/ui/use-toast";

interface PurchaseListProps {
  onBack?: () => void;
}

const PurchaseList = ({ onBack }: PurchaseListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseFormLoading, setPurchaseFormLoading] = useState(false);
  const { purchases, loading, createPurchase, updatePurchase, deletePurchase } = usePurchases();
  const { toast } = useToast();

  const filteredPurchases = purchases.filter(purchase =>
    purchase.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePurchase = async (data: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setPurchaseFormLoading(true);
    try {
      await createPurchase(data);
      setShowPurchaseForm(false);
      toast({
        title: "Success",
        description: "Purchase created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase",
        variant: "destructive",
      });
    } finally {
      setPurchaseFormLoading(false);
    }
  };

  const handleUpdatePurchase = async (data: Omit<Purchase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!selectedPurchase) return;
    
    setPurchaseFormLoading(true);
    try {
      await updatePurchase(selectedPurchase.id, data);
      setSelectedPurchase(null);
      setShowPurchaseForm(false);
      toast({
        title: "Success",
        description: "Purchase updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase",
        variant: "destructive",
      });
    } finally {
      setPurchaseFormLoading(false);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      try {
        await deletePurchase(id);
        toast({
          title: "Success",
          description: "Purchase deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete purchase",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="p-1 h-8 w-8">
                ← 
              </Button>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Purchases</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Track all purchase transactions</p>
        </div>
        <Button 
          onClick={() => setShowPurchaseForm(true)} 
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Purchase
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-white dark:bg-slate-800 shadow-soft border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-11"
          />
        </div>
      </Card>

      {/* Purchase Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product/Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {purchase.product_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {purchase.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ${purchase.unit_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${purchase.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {purchase.notes || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border">
                        <DropdownMenuItem onClick={() => {
                          setSelectedPurchase(purchase);
                          setShowPurchaseForm(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePurchase(purchase.id)}
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
        </div>
      </Card>

      {filteredPurchases.length === 0 && (
        <Card className="p-8 sm:p-12 text-center bg-white dark:bg-slate-800 shadow-soft border-slate-200 dark:border-slate-700">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">No purchases found</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm ? "Try adjusting your search" : "Start by adding your first purchase"}
          </p>
        </Card>
      )}

      {/* Purchase Form Dialog */}
      <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPurchase ? 'Edit Purchase' : 'Add New Purchase'}</DialogTitle>
          </DialogHeader>
          <PurchaseForm
            customerId=""
            purchase={selectedPurchase}
            onSubmit={selectedPurchase ? handleUpdatePurchase : handleCreatePurchase}
            onCancel={() => {
              setShowPurchaseForm(false);
              setSelectedPurchase(null);
            }}
            loading={purchaseFormLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseList;