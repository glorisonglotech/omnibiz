
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/components/RoleBasedAccess";
import AdminDashboard from "./dashboard/AdminDashboard";
import ClientDashboard from "./dashboard/ClientDashboard";
import ManagerDashboard from "./dashboard/ManagerDashboard";
import StaffDashboard from "./dashboard/StaffDashboard";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { isAdmin, isClient } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your dashboard.</div>;
  }

  // Render role-specific dashboards
  if (isAdmin()) {
    return <AdminDashboard />;
  }
  if (isClient()) {
    return <ClientDashboard />;
  }
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }
  if (user?.role === 'staff') {
    return <StaffDashboard />;
  }

  // Fallback: generic dashboard or message
  return <div>Your role does not have a specific dashboard.</div>;
};

export default Dashboard;
