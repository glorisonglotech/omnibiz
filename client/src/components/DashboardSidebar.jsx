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
  Headphones,
  Video,
  MessageCircle,
  Mail,
  Phone,
  CreditCard,
  Map,
  Layout,
  Globe,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  // Dashboard & Analytics
  { name: "Overview", href: "/dashboard", icon: BarChart3, section: "main" },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, section: "main" },
  { name: "Graphs", href: "/dashboard/graphs", icon: PieChart, section: "main" },
  { name: "Maps", href: "/dashboard/maps", icon: Map, section: "main" },
  
  // Business Operations
  { name: "Inventory", href: "/dashboard/inventory", icon: Package, section: "business" },
  { name: "Products", href: "/dashboard/products", icon: Package, section: "business" },
  { name: "E-Commerce", href: "/dashboard/ecommerce", icon: ShoppingCart, section: "business" },
  { name: "Discounts", href: "/dashboard/discounts", icon: Tag, section: "business" },
  { name: "Services", href: "/dashboard/services", icon: Briefcase, section: "business" },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, section: "business" },
  { name: "Finances", href: "/dashboard/finances", icon: DollarSign, section: "business" },
  { name: "Purchasing", href: "/dashboard/purchasing", icon: ShoppingCart, section: "business" },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard, section: "business" },
  
  // Communication & Support
  { name: "Live Sessions", href: "/dashboard/sessions", icon: Video, section: "communication", badge: "New" },
  { name: "Messages", href: "/dashboard/messages", icon: MessageCircle, section: "communication" },
  { name: "Live Support", href: "/dashboard/support", icon: Headphones, section: "communication" },
  
  // Team & Management
  { name: "Team", href: "/dashboard/team", icon: Users, section: "team" },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Brain, section: "team" },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin, section: "team" },
  
  // Security & Monitoring
  { name: "Security", href: "/dashboard/security", icon: Shield, section: "security", badge: "AI", adminOnly: true },
  
  // Tools & Resources
  { name: "Reports", href: "/dashboard/reports", icon: FileText, section: "tools" },
  { name: "History", href: "/dashboard/history", icon: History, section: "tools" },
  { name: "Search", href: "/dashboard/search", icon: Search, section: "tools" },
  { name: "Learning Center", href: "/dashboard/resources", icon: BookOpen, section: "tools" },
  { name: "UI Components", href: "/dashboard/gui", icon: Layout, section: "tools" },
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
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navigationItems.map((item) => {
            // Filter admin-only items
            if (item.adminOnly && user?.role !== 'admin' && user?.role !== 'super_admin') {
              return null;
            }
            
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")}
                />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                        isActive 
                          ? "bg-primary-foreground text-primary"
                          : item.badge === "AI" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" : "bg-green-500 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {isCollapsed && item.badge && (
                  <span className={cn(
                    "absolute top-1 right-1 h-2 w-2 rounded-full",
                    item.badge === "AI" ? "bg-purple-500" : "bg-green-500"
                  )}></span>
                )}
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
