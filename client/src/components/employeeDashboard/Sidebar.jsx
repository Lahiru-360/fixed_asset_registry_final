import { Home, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import companylogo from "/images/companylogo.jpeg";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-71.5 flex-col p-6 gap-8 bg-sidebar border-r border-muted shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-muted bg-muted/30 flex items-center justify-center shadow-sm">
          <img
            src={companylogo}
            alt="Company Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h2 className="text-md font-semibold text-foreground">ABC Company</h2>
          <p className="text-sm text-muted-foreground">Fixed Asset Registry</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5">
        <NavItem
          icon={Home}
          label="Dashboard"
          active={location.pathname === "/user"}
          onClick={() => navigate("/user")}
        />

        <NavItem
          icon={Settings}
          label="Settings"
          active={location.pathname === "/settings"}
          onClick={() => navigate("/settings")}
        />
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 group border border-transparent hover:border-muted"
      >
        <LogOut className="w-5 h-5 transition-colors" />
        <span className="text-sm font-medium">Sign out</span>
      </button>
    </aside>
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
