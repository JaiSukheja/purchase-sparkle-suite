import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import ComprehensiveAdminDashboard from '@/components/enhanced/ComprehensiveAdminDashboard';

const AdminDashboard = () => {
  return (
    <AdminProtectedRoute>
      <ComprehensiveAdminDashboard />
    </AdminProtectedRoute>
  );
};


export default AdminDashboard;