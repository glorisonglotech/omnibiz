import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import LiveChatWidget from "./storefront/LiveChatWidget";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
       <LiveChatWidget />
    </div>
  );
};

export default DashboardLayout;
