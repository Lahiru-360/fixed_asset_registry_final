// src/layout/AdminLayout.jsx
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import MobileSidebar from "../components/admin/MobileSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <AdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
