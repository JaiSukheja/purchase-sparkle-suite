import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, trend }: StatsCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card shadow-soft hover:shadow-elegant transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-primary rounded-lg">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;