// src/components/admin/MobileSidebar.jsx

import {
  X,
  Home,
  FileText,
  Boxes,
  TrendingDown,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import companylogo from "/images/companylogo.jpeg";

export default function MobileSidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* SLIDE-IN SIDEBAR */}
      <aside
        className="
        absolute left-0 top-0 h-full w-72
        bg-sidebar border-r border-muted shadow-xl
        p-6 flex flex-col gap-8
        animate-slideIn
      "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
              w-12 h-12 rounded-xl overflow-hidden
              border border-muted bg-muted/30
              flex items-center justify-center shadow-sm
            "
            >
              <img
                src={companylogo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <h2 className="text-md font-semibold text-foreground">
                ABC Company
              </h2>
              <p className="text-sm text-muted-foreground">
                Fixed Asset Registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              p-2 rounded-lg
              text-muted-foreground
              hover:bg-muted hover:text-foreground
              transition
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 flex flex-col gap-1.5">
          <SidebarLink
            icon={Home}
            label="Dashboard"
            to="/admin/dashboard"
            active={pathname === "/admin/dashboard"}
            navigate={navigate}
            onClose={onClose}
          />

          <SidebarLink
            icon={FileText}
            label="Requests"
            to="/admin/requests"
            active={pathname === "/admin/requests"}
            navigate={navigate}
            onClose={onClose}
          />

          <SidebarLink
            icon={Boxes}
            label="Assets"
            to="/admin/assets"
            active={pathname === "/admin/assets"}
            navigate={navigate}
            onClose={onClose}
          />

          <SidebarLink
            icon={TrendingDown}
            label="Depreciation"
            to="/admin/depreciation"
            active={pathname === "/admin/depreciation"}
            navigate={navigate}
            onClose={onClose}
          />

          <SidebarLink
            icon={BarChart3}
            label="SOFP"
            to="/admin/sofp"
            active={pathname === "/admin/sofp"}
            navigate={navigate}
            onClose={onClose}
          />
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="
            flex items-center gap-3 px-4 py-3 rounded-xl
            text-muted-foreground
            hover:bg-muted hover:text-foreground
            transition-all duration-200
            border border-transparent hover:border-muted
          "
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </aside>
    </div>
  );
}

/* Same behavior as desktop NavItem — styles aligned */
function SidebarLink({ icon: Icon, label, to, active, navigate, onClose }) {
  return (
    <button
      onClick={() => {
        navigate(to);
        onClose();
      }}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-xl
        transition-all duration-200 font-medium text-sm
        ${
          active
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-muted"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
