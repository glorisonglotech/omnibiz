import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
  Users,
  Brain,
  MapPin,
  BarChart3,
  Menu,
  X,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Import useAuth to get user info

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "E-Commerce", href: "/dashboard/ecommerce", icon: ShoppingCart },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Brain },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
];

function DashboardSidebar() {
  const { user, isAuthenticated } = useAuth(); // Use AuthContext to get user details
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback user data if the user is not authenticated
  const userName = isAuthenticated ? user?.name : "Guest";
  const userInitials = isAuthenticated ? user?.name.split(" ").map((n) => n[0]).join("") : "G";

  return (
    <div
      className={cn(
        "bg-white border-r border-green-100 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-green-100">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="https://2aa832b0f010801d3551c6c63b116063.cdn.bubble.io/cdn-cgi/image/w=48,h=48,f=auto,dpr=1,fit=contain/f1758225569468x933635082935872100/logo.webp"
                alt=""
              />
              <span className="text-xl font-bold text-green-700">
                Omin<span className="text-green-500">Biz</span>
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-green-600 hover:text-green-700"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-green-700 hover:bg-green-100 hover:text-green-800"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info and settings */}
        <div className="border-t border-green-100">
          {/* Settings and Profile Links */}
          <div className="p-2 space-y-1">
            <Link
              to="/dashboard/settings"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/dashboard/settings"
                  ? "bg-green-600 text-white"
                  : "text-green-700 hover:bg-green-100 hover:text-green-800"
              )}
            >
              <Settings
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Settings</span>}
            </Link>
            <Link
              to="/dashboard/profile"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/dashboard/profile"
                  ? "bg-green-600 text-white"
                  : "text-green-700 hover:bg-green-100 hover:text-green-800"
              )}
            >
              <User
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </div>

          {/* User info */}
          {!isCollapsed && (
            <div className="p-4 border-t border-green-100">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{userInitials}</span> {/* Show user initials */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {userName} {/* Display the user's name */}
                  </p>
                  <p className="text-xs text-green-500 truncate">Admin</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSidebar;
