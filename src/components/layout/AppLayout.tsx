import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationContext } from "@/hooks/useOrganizationContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Home, Users, ShoppingCart, BarChart3, FileText } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";

const AppLayout = () => {
  const { signOut } = useAuth();
  const { selectedOrganizationId } = useOrganizationContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to organization selection if no organization is selected
  if (!selectedOrganizationId) {
    navigate('/');
    return null;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/app/dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/app/customers' },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart, path: '/app/purchases' },
    { id: 'invoices', label: 'Invoices', icon: FileText, path: '/app/invoices' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/app/reports' },
  ];

  const getActiveView = () => {
    const path = location.pathname;
    const item = navItems.find(item => path.startsWith(item.path));
    return item?.id || 'dashboard';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background grid grid-cols-[auto_1fr]">
        <Sidebar className="border-r fixed h-screen overflow-y-auto">
          <SidebarHeader className="p-6 border-b">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Client Manager
            </h2>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu className="p-4 space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      getActiveView() === item.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground/80 hover:bg-accent'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <SidebarTrigger />
              <Button variant="outline" onClick={() => signOut()} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;