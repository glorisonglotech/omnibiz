import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Inventory from "./pages/dashboard/Inventory";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import ECommerce from "./pages/dashboard/ECommerce";
import Appointments from "./pages/dashboard/Appointments";
import Team from "./pages/dashboard/Team";
import Finances from "./pages/dashboard/Finances";
import Subscriptions from "./pages/dashboard/Subscriptions";
import AIInsights from "./pages/dashboard/AIInsights";
import Locations from "./pages/dashboard/Locations";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import Wallet from "./pages/dashboard/Wallet";
import Products from "./pages/dashboard/Products";
import Checkout from "./pages/dashboard/Checkout";
import SplashScreen from "./pages/SplashScreen";
import FeaturesPage from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import Analytics from "./pages/dashboard/Analytics";
import Maps from "./pages/dashboard/Maps";
import Purchasing from "./pages/dashboard/Purchasing";
import History from "./pages/dashboard/History";
import Search from "./pages/dashboard/Search";
import GraphsShowcase from "./pages/dashboard/GraphsShowcase";
import Reports from "./pages/dashboard/Reports";
import HelpSupport from "./pages/dashboard/HelpSupport";
import GUIImplementation from "./components/GUIImplementation";
import { AuthProvider } from "@/context/AuthContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import updateService from "@/services/updateServices";
import ThemeSync from "@/components/ThemeSync";
import { FinancialProvider } from "@/context/FinancialContext";
import { PWAProvider } from "@/context/PWAContext";
import { SocketProvider } from "@/context/SocketContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdateNotification from "@/components/PWAUpdateNotification";
import ClientSignup from "@/pages/client/ClientSignup";
import ClientStorefront from "@/pages/client/ClientStorefront";
import Store from "@/pages/Store";
import ProductCatalog from "@/pages/client/ProductCatalog";
import BookAppointment from "@/pages/client/BookAppointment";
import MyBookings from "@/pages/client/MyBookings";
import ClientLogin from "./pages/client/ClientLogin";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Always show splash screen on app load/refresh
    const timer = setTimeout(() => {
      setShowSplash(false);
      setAppReady(true);

      // Initialize update service when app is ready
      updateService.start();
    }, 3000); // Show splash for 3 seconds

    return () => {
      clearTimeout(timer);
      updateService.stop();
    };
  }, []);

  // Initialize update service when app is ready
  useEffect(() => {
    if (appReady) {
      // Initialize automatic updates for existing users
      updateService.initialize();

      // Show welcome message for new features
      updateService.showWelcomeMessage();

      // Cleanup on unmount
      return () => {
        updateService.destroy();
      };
    }
  }, [appReady]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setAppReady(true);
  };

  if (showSplash || !appReady) {
    return (
      <ThemeProvider>
        <SplashScreen onComplete={handleSplashComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PWAProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <SocketProvider>
                <FinancialProvider>
                  <CartProvider>
                  <BrowserRouter>
                    <ThemeSync />
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/loginpage" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    
                    {/* Client Routes */}
                    <Route path="/client/signup/:inviteCode" element={<ClientSignup />} />
                    <Route path="/client/login/:inviteCode" element={<ClientLogin />} />
                    <Route path="/client/store/:inviteCode" element={<ClientStorefront />} />
                    <Route path="/client/catalog" element={<ProductCatalog />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/client/book" element={<BookAppointment />} />
                    <Route path="/client/my-bookings" element={<MyBookings />} />

                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      {/* Dashboard Main Route */}
                      <Route index element={<Dashboard />} />

                      {/* Dashboard Sub-Routes */}
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="ecommerce" element={<ECommerce />} />
                      <Route path="appointments" element={<Appointments />} />
                      <Route path="finances" element={<Finances />} />
                      <Route path="subscriptions" element={<Subscriptions />} />
                      <Route path="team" element={<Team />} />
                      <Route path="ai-insights" element={<AIInsights />} />
                      <Route path="locations" element={<Locations />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="wallet" element={<Wallet />} />
                      <Route path="products" element={<Products />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="help" element={<Help />} />
                      <Route path="support" element={<HelpSupport />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="maps" element={<Maps />} />
                      <Route path="purchasing" element={<Purchasing />} />
                      <Route path="history" element={<History />} />
                      <Route path="search" element={<Search />} />
                      <Route path="graphs" element={<GraphsShowcase />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="gui" element={<GUIImplementation />} />
                    </Route>

                    {/* Catch-all Route for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <PWAInstallPrompt />
                  <PWAUpdateNotification />
                  <Toaster 
                    position="top-center" 
                    expand={true}
                    toastOptions={{
                      classNames: {
                        toast: 'group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-green-200 group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-sm',
                        description: 'group-[.toast]:text-slate-600',
                        actionButton: 'group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:hover:bg-green-700',
                        cancelButton: 'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700 group-[.toast]:hover:bg-slate-200',
                        error: 'group-[.toaster]:bg-white group-[.toaster]:text-red-900 group-[.toaster]:border-red-200',
                        success: 'group-[.toaster]:bg-white group-[.toaster]:text-green-900 group-[.toaster]:border-green-300',
                        warning: 'group-[.toaster]:bg-white group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200',
                        info: 'group-[.toaster]:bg-white group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200',
                      },
                      style: {
                        borderWidth: '2px',
                      },
                      duration: 4000,
                    }}
                  />
                  </BrowserRouter>
                  </CartProvider>
                </FinancialProvider>
              </SocketProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </PWAProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
