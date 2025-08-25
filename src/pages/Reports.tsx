import { ReportsOverview } from "@/components/reports/ReportsOverview";
import { useCustomers } from "@/hooks/useCustomers";
import { usePurchases } from "@/hooks/usePurchases";
import { useInvoices } from "@/hooks/useInvoices";

const Reports = () => {
  const { customers } = useCustomers();
  const { purchases } = usePurchases();
  const { invoices } = useInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Business insights and analytics</p>
      </div>

      <ReportsOverview 
        customers={customers}
        purchases={purchases}
        invoices={invoices}
      />
    </div>
  );
};

export default Reports;