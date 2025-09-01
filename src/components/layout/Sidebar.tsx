import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, ShoppingCart, FileText, BarChart3, Building, LogOut, Crown, CreditCard, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { useOrganizationContext } from "@/hooks/useOrganizationContext";
import { OrganizationSelector } from "@/components/organizations/OrganizationSelector";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/app/dashboard", icon: Home },
  { title: "Customers", url: "/app/customers", icon: Users },
  { title: "Purchases", url: "/app/purchases", icon: ShoppingCart },
  { title: "Invoices", url: "/app/invoices", icon: FileText },
  { title: "Reports", url: "/app/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const { subscription } = useSubscription();
  const { isAdmin } = useAdmin();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationContext();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // helpers
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  const adminItems = [
    { title: "Admin Dashboard", url: "/admin", icon: Crown }
  ];

  const accountItems = [
    { title: "Profile", url: "/app/profile", icon: User },
    { title: "Pricing", url: "/pricing", icon: CreditCard }
  ];

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">Business Manager</h2>
              <p className="text-xs text-muted-foreground">Multi-business platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Organization Selector */}
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <OrganizationSelector 
              selectedOrgId={selectedOrganizationId || ''}
              onOrganizationChange={setSelectedOrganizationId}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.title}</span>
                          {subscription && (
                            <Badge variant="secondary" className="text-xs">
                              {subscription.plan?.name}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={({ isActive }) => getNavCls({ isActive })}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton 
          onClick={signOut}
          className="hover:bg-muted/50"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}