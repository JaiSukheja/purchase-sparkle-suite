import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { Purchase } from "@/types/database";
import { usePurchases } from "@/hooks/usePurchases";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PurchaseForm from "../forms/PurchaseForm";
import { useToast } from "@/components/ui/use-toast";

interface PurchaseListProps {
  onBack: () => void;
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

      {/* Purchase List */}
      <div className="grid gap-4">
        {filteredPurchases.map((purchase) => (
          <Card key={purchase.id} className="p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-soft hover:shadow-elegant transition-all duration-300 border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">{purchase.product_name}</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                    <span>Qty: {purchase.quantity}</span>
                    <span>Unit: ${purchase.unit_price.toFixed(2)}</span>
                    <span className="font-medium text-slate-900 dark:text-white">Total: ${purchase.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </Badge>
                  </div>
                  {purchase.notes && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                      {purchase.notes}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedPurchase(purchase);
                    setShowPurchaseForm(true);
                  }}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">Edit</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeletePurchase(purchase.id)}
                  className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">Delete</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

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