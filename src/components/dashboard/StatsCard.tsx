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
    <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 shadow-soft hover:shadow-elegant transition-all duration-300 border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className="p-2 sm:p-3 bg-slate-900 dark:bg-white rounded-lg ml-3 flex-shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white dark:text-slate-900" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;