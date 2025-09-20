import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CogIcon,
  LogoutIcon,
  DashboardIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Inventory', href: '/inventory', icon: BuildingOfficeIcon },
  ];

  const publicNavItems = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActiveLink = (href) => location.pathname === href;

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Omni<span className="text-primary">BIZ</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              // Authenticated Navigation
              navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActiveLink(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            ) : (
              // Public Navigation
              publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // User Menu
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground">Business Manager</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <LogoutIcon className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Auth Buttons
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors">
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {isAuthenticated ? (
                // Authenticated Mobile Navigation
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-3 border-b border-border mb-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">John Doe</p>
                      <p className="text-xs text-muted-foreground">Business Manager</p>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActiveLink(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {/* User Menu Items */}
                  <div className="pt-4 border-t border-border space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md"
                    >
                      <LogoutIcon className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                // Public Mobile Navigation
                <>
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Auth Buttons */}
                  <div className="pt-4 space-y-2">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="bg-primary text-primary-foreground w-full hover:bg-primary/90">
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
