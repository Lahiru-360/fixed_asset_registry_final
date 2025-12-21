// src/layout/AdminLayout.jsx
import { useState } from "react";
import Sidebar from "../components/employeeDashboard/Sidebar";
import MobileSidebar from "../components/employeeDashboard/MobileSidebar";
import TopBar from "../components/employeeDashboard/TopBar";

export default function EmployeeLayout({ children, onNewRequest }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNew={onNewRequest}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
