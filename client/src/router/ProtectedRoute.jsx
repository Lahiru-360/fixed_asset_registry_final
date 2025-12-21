import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If user exists and their role is allowed
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // Otherwise, deny access
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
