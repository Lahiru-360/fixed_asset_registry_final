import React from "react";
import { X, Home, Settings, LogOut } from "lucide-react";
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
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* SLIDE-IN SIDEBAR */}
      <div className="absolute left-0 top-0 h-full w-72 bg-sidebar shadow-2xl animate-slideIn flex flex-col gap-8 p-6">
        {/* HEADER + LOGO */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-muted bg-muted/30 flex items-center justify-center shadow-sm">
              <img
                src={companylogo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-foreground">
                ABC Company
              </h2>
              <p className="text-sm text-muted-foreground">
                Fixed Asset Registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1.5 flex-1">
          <NavItem
            icon={Home}
            label="Dashboard"
            active={pathname === "/user"}
            onClick={() => {
              navigate("/user");
              onClose();
            }}
          />

          <NavItem
            icon={Settings}
            label="Settings"
            active={pathname === "/settings"}
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
          />
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 group border border-transparent hover:border-muted"
        >
          <LogOut className="w-5 h-5 transition-colors" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
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
