import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CustomerAuthProvider } from "@/hooks/useCustomerAuth";
import { OrganizationProvider } from "@/hooks/useOrganizationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Purchases from "./pages/Purchases";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import OrganizationSelection from "./pages/OrganizationSelection";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerAuth from "./pages/CustomerAuth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CustomerAuthProvider>
        <OrganizationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <OrganizationSelection />
                  </ProtectedRoute>
                } />
                <Route path="/app" element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="purchases" element={<Purchases />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<Profile />} />
                  <Route index element={<DashboardPage />} />
                </Route>
                {/* Customer Detail Page */}
                <Route path="/customer/:id" element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                } />
                <Route path="/customer-auth" element={<CustomerAuth />} />
                <Route path="/customer-portal" element={<CustomerPortal />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OrganizationProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
