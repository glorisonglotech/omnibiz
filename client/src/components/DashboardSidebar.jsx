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
  LogOut,
  HelpCircle,
  History,
  Search,
  PieChart,
  FileText,
  TrendingUp,
  Monitor,
  Wallet,
  Tag,
  Briefcase,
  BookOpen,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Graphs", href: "/dashboard/graphs", icon: PieChart },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "E-Commerce", href: "/dashboard/ecommerce", icon: ShoppingCart },
  { name: "Discounts", href: "/dashboard/discounts", icon: Tag },
  { name: "Services", href: "/dashboard/services", icon: Briefcase },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Brain },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "GUI Demo", href: "/dashboard/gui", icon: Monitor },
  { name: "Live Support", href: "/dashboard/support", icon: Headphones },
  { name: "Learning Center", href: "/dashboard/resources", icon: BookOpen },
];

function DashboardSidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback user data if the user is not authenticated
  const userName = isAuthenticated ? user?.name : "Guest";
  const userInitials = isAuthenticated ? user?.name.split(" ").map((n) => n[0]).join("") : "G";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 shadow-sm",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src="https://2aa832b0f010801d3551c6c63b116063.cdn.bubble.io/cdn-cgi/image/w=48,h=48,f=auto,dpr=1,fit=contain/f1758225569468x933635082935872100/logo.webp"
                alt=""
              />
              <span className="text-xl font-bold text-primary">
                Omin<span className="text-accent">Biz</span>
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-primary hover:text-primary/80"
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
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
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
        <div className="border-t border-border">
          {/* Settings and Profile Links */}
          <div className="p-2 space-y-1">
            <Link
              to="/dashboard/settings"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/dashboard/settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
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
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <User
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Profile</span>}
            </Link>

            {/* Wallet Link */}
            <Link
              to="/dashboard/wallet"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/dashboard/wallet"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Wallet
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Wallet</span>}
            </Link>

            {/* Help Link */}
            <Link
              to="/dashboard/help"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === "/dashboard/help"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <HelpCircle
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Help & Support</span>}
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-start",
                "text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <LogOut
                className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")}
              />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>

          {/* User info */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-primary-foreground">{userInitials}</span> {/* Show user initials */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userName} {/* Display the user's name */}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role || 'User'}</p>
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
