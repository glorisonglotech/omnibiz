import { Search, Settings, LogOut, User, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { toast } from "sonner";
import NotificationCenter from "./NotificationCenter";
import ProfilePicture from "./ProfilePicture";
import Logo from "./ui/logo";
import ThemeSwitcher from "./ThemeSwitcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DashboardTopbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);

      // Show search toast
      toast.info(`Searching for: "${searchQuery.trim()}"`);
    }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.length > 0 && pathSegments[0] === 'dashboard') {
      breadcrumbs.push({ name: 'Dashboard', path: '/dashboard' });

      if (pathSegments.length > 1) {
        const currentPage = pathSegments[1];
        const pageNames = {
          'inventory': 'Inventory',
          'ecommerce': 'E-Commerce',
          'appointments': 'Appointments',
          'finances': 'Finances',
          'team': 'Team',
          'ai-insights': 'AI Insights',
          'locations': 'Locations',
          'settings': 'Settings',
          'profile': 'Profile',
          'products': 'Products',
          'help': 'Help & Support',
          'analytics': 'Analytics',
          'maps': 'Maps',
          'purchasing': 'Purchasing'
        };

        breadcrumbs.push({
          name: pageNames[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1),
          path: `/dashboard/${currentPage}`,
          current: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Fallbacks if user is not loaded yet
  const userName = user?.name || user?.fullName || "Admin";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-sm">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                  <BreadcrumbItem>
                    {breadcrumb.current ? (
                      <BreadcrumbPage className="text-primary font-medium">
                        {breadcrumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={breadcrumb.path}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {breadcrumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across modules..."
              className="pl-10 bg-accent/50 border-input focus-visible:ring-primary"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Enhanced Theme Switcher */}
          <ThemeSwitcher />

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-accent"
              >
                <ProfilePicture
                  user={user}
                  size="sm"
                  editable={false}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || 'User'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border">
              <DropdownMenuLabel className="text-foreground font-medium">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                onClick={() => navigate('/dashboard/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
