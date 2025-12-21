// src/components/admin/AdminTopbar.jsx
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar({ onOpenMobileMenu }) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-muted bg-background">
      {/* Mobile menu button */}
      <button
        onClick={onOpenMobileMenu}
        className="lg:hidden p-2 rounded-md bg-muted hover:bg-muted/70"
      >
        <Menu />
      </button>
      <div>
        <h1 className="text-lg md:text-2xl font-semibold">
          Welcome, {user?.first_name ?? "Admin"}
        </h1>
        <p className="text-sm opacity-70 text-center md:text-left">
          Admin Console
        </p>
      </div>

      <div className="flex items-center gap-3 md:gap-4"></div>
    </header>
  );
}
