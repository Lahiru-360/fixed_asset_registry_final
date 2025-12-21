// Updated TopBar.jsx (responsive text sizes)
import { Bell, Plus, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function TopBar({ onNew, onOpenMobileMenu }) {
  const { user } = useAuth();
  const location = useLocation();

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
          Welcome, {user?.first_name ?? "Employee"}
        </h1>
        <p className="text-sm opacity-70">{user?.department ?? "—"}</p>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {location.pathname === "/user" && (
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus /> <span className="hidden md:inline">New</span>
          </button>
        )}
      </div>
    </header>
  );
}
