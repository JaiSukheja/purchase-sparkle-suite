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
      <ReportsOverview 
        customers={customers}
        purchases={purchases}
        invoices={invoices}
      />
    </div>
  );
};

export default Reports;