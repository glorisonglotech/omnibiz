import { usePermissions } from "@/components/RoleBasedAccess";
import AdminDashboard from "./dashboard/AdminDashboard";
import ClientDashboard from "./dashboard/ClientDashboard";
import ManagerDashboard from "./dashboard/ManagerDashboard";
import StaffDashboard from "./dashboard/StaffDashboard";

const Dashboard = () => {
  const { hasRole } = usePermissions();

  // Role-based dashboard rendering
  if (hasRole(['super_admin', 'admin'])) {
    return <AdminDashboard />;
  }

  if (hasRole(['manager'])) {
    return <ManagerDashboard />;
  }

  if (hasRole(['staff'])) {
    return <StaffDashboard />;
  }

  if (hasRole(['client'])) {
    return <ClientDashboard />;
  }

  // Default fallback
  return <ClientDashboard />;
};

export default Dashboard;
