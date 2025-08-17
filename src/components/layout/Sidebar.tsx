import { Users, ShoppingCart, BarChart3, Plus, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: 'dashboard' | 'customers';
  onViewChange: (view: 'dashboard' | 'customers') => void;
}

const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-gradient-card backdrop-blur-glass border-r border-border/50 flex flex-col">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          ClientFlow
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Customer Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as 'dashboard' | 'customers')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                "hover:bg-accent/50 hover:shadow-soft",
                activeView === item.id
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : "text-foreground/80"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
          <Plus className="h-5 w-5" />
          <span className="font-medium">Quick Add</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;