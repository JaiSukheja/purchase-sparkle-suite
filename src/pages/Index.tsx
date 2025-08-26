import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomerList from "@/components/customers/CustomerList";
import Dashboard from "@/components/dashboard/Dashboard";
import PurchaseList from "@/components/dashboard/PurchaseList";
import Analytics from "@/components/dashboard/Analytics";
import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { InvoicesTable } from "@/components/tables/InvoicesTable";
import { InvoiceViewer } from "@/components/invoices/InvoiceViewer";
import InvoiceForm from "@/components/forms/InvoiceForm";
import CustomerForm from "@/components/forms/CustomerForm";
import { useCustomers } from "@/hooks/useCustomers";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";
import { useAuth } from "@/hooks/useAuth";
import { Customer, Invoice } from "@/types/database";
import { LogOut, Menu, X, Home, Users, ShoppingCart, BarChart3, FileText, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { customers, createCustomer, updateCustomer, loading } = useCustomers();
  const { purchases } = usePurchases();
  const { invoices, createInvoice, updateInvoice, deleteInvoice } = useInvoices();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'dashboard' | 'customers' | 'purchases' | 'analytics' | 'invoices' | 'reports'>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInvoiceViewer, setShowInvoiceViewer] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditDialog(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}`);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowEditDialog(true);
  };

  const handleCustomerSubmit = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, customerData);
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await createCustomer(customerData);
        toast({
          title: "Success", 
          description: "Customer created successfully",
        });
      }
      
      setShowEditDialog(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleInvoiceSubmit = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    
    try {
      if (selectedInvoice) {
        await updateInvoice(selectedInvoice.id, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }
      
      setShowInvoiceDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceDialog(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Client Manager
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as 'dashboard' | 'customers' | 'purchases' | 'invoices' | 'reports');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen w-64 xl:w-72 flex-col border-r bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm">
        <div className="flex h-14 xl:h-16 items-center border-b px-4 xl:px-6">
          <h2 className="text-lg xl:text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Client Manager
          </h2>
        </div>
        <nav className="flex-1 space-y-1 p-4 xl:p-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as 'dashboard' | 'customers' | 'purchases' | 'invoices' | 'reports')}
              className={`w-full flex items-center space-x-3 px-3 xl:px-4 py-2.5 xl:py-3 text-sm xl:text-base font-medium rounded-lg transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 xl:h-5 xl:w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b bg-white dark:bg-slate-900 sticky top-0 z-40">
          <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Client Manager
          </h1>
          <Button variant="outline" onClick={() => signOut()} size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop header and content */}
        <div className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Manage your customers and grow your business</p>
              </div>
              <Button variant="outline" onClick={() => signOut()} size="sm" className="self-end sm:self-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            {activeView === 'dashboard' && (
              <Dashboard 
                customers={customers}
                onEditCustomer={handleEditCustomer}
                onViewCustomer={handleViewCustomer}
                onAddCustomer={handleAddCustomer}
                onAddPurchase={() => setActiveView('purchases')}
                onAddInvoice={handleAddInvoice}
              />
            )}
            
            {activeView === 'customers' && (
              <CustomerList 
                customers={customers}
                onEditCustomer={handleEditCustomer}
                onViewCustomer={handleViewCustomer}
                onAddCustomer={handleAddCustomer}
                loading={loading}
              />
            )}
            
            {activeView === 'purchases' && (
              <PurchaseList onBack={() => setActiveView('dashboard')} />
            )}
            
            {activeView === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold">Invoices</h1>
                    <p className="text-muted-foreground">Manage your customer invoices</p>
                  </div>
                  <Button onClick={handleAddInvoice}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </div>
                <InvoicesTable
                  invoices={invoices}
                  onEdit={handleEditInvoice}
                  onDelete={handleDeleteInvoice}
                  onView={(invoice) => {
                    setSelectedInvoice(invoice);
                    setShowInvoiceViewer(true);
                  }}
                  onDownload={(invoice) => {
                    // Add download functionality
                    console.log('Download invoice:', invoice);
                  }}
                  onSend={(invoice) => {
                    // Add send functionality
                    console.log('Send invoice:', invoice);
                  }}
                />
              </div>
            )}

            {activeView === 'reports' && (
              <ReportsOverview 
                customers={customers}
                purchases={purchases}
                invoices={invoices}
              />
            )}
          </div>
        </div>
      </main>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={selectedCustomer}
            onSubmit={handleCustomerSubmit}
            onCancel={() => setShowEditDialog(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={selectedInvoice}
            customers={customers}
            onSubmit={handleInvoiceSubmit}
            onCancel={() => setShowInvoiceDialog(false)}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      <InvoiceViewer
        invoice={selectedInvoice}
        isOpen={showInvoiceViewer}
        onClose={() => setShowInvoiceViewer(false)}
        onDownload={(invoice) => {
          console.log('Download invoice:', invoice);
          // Implement download functionality
        }}
        onSend={(invoice) => {
          console.log('Send invoice:', invoice);
          // Implement send functionality
        }}
        onPrint={(invoice) => {
          console.log('Print invoice:', invoice);
          window.print();
        }}
      />
    </div>
  );
};

export default Index;
