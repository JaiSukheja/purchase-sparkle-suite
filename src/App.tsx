import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/hooks/useOrganizationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import OrganizationSelection from "./pages/OrganizationSelection";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerPortal from "./pages/CustomerPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/customer/:id" element={
                <ProtectedRoute>
                  <CustomerDetail />
                </ProtectedRoute>
              } />
              <Route path="/customer-portal/:customerId" element={<CustomerPortal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
