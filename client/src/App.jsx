import React from "react";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
          </Route> */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="ecommerce" element={<ECommerce />} />
          <Route path="appointments" element={<Appointments />} />
           <Route path="finances" element={<Finances />} />
          <Route path="team" element={<Team />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
