import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRedirector = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return (
        <div className="min-h-screen bg-background text-foreground transition-colors">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin"></div>
          </div>
        </div>
      );
    }
    if (!user) {
      console.log("No user, redirecting to /login");
      navigate("/login", { replace: true });
      return;
    }

    switch (user.role) {
      case "admin":
        navigate("/admin/requests", { replace: true });
        break;
      case "employee":
        navigate("/user", { replace: true });
        break;
      default:
        console.log("Unknown role, redirecting to /login");
        navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  return null;
};

export default RoleRedirector;
