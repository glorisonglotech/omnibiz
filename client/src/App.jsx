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
import AIInsights from "./pages/dashboard/AIInsights";
import Locations from "./pages/dashboard/Locations";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import Products from "./pages/dashboard/Products";
import Checkout from "./pages/dashboard/Checkout";
import SplashScreen from "./pages/SplashScreen";
import FeaturesPage from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Help from "./pages/Help";
import Analytics from "./pages/dashboard/Analytics";
import Maps from "./pages/dashboard/Maps";
import Purchasing from "./pages/dashboard/Purchasing";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Logo from "@/components/ui/logo";
import { FinancialProvider } from "@/context/FinancialContext";
import { PWAProvider } from "@/context/PWAContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdateNotification from "@/components/PWAUpdateNotification";

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Always show splash screen on app load/refresh
    const timer = setTimeout(() => {
      setShowSplash(false);
      setAppReady(true);
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, []);

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
            <SocketProvider>
              <FinancialProvider>
              <BrowserRouter>
                <Toaster richColors position="top-center" />
                <PWAInstallPrompt />
                <PWAUpdateNotification />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/loginpage" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="ecommerce" element={<ECommerce />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="finances" element={<Finances />} />
                    <Route path="team" element={<Team />} />
                    <Route path="ai-insights" element={<AIInsights />} />
                    <Route path="locations" element={<Locations />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="products" element={<Products />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="help" element={<Help />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="maps" element={<Maps />} />
                    <Route path="purchasing" element={<Purchasing />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </FinancialProvider>
            </SocketProvider>
          </AuthProvider>
        </PWAProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
