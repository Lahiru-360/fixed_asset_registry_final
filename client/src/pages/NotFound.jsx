import { Link } from "react-router-dom";
import { AlertTriangle, Coffee } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();

  const homePath =
    user?.role === "admin"
      ? "/admin/requests"
      : user?.role === "employee"
      ? "/user"
      : "/";

  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center">
        <div className="relative bg-muted/50 border border-muted rounded-3xl p-10 shadow-sm overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>

          <h2 className="text-xl font-semibold text-foreground mb-3 flex justify-center">
            This page took a coffee break{" "}
            <Coffee className="w-7 h-7 text-foreground ml-2" />
          </h2>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            We couldn’t find what you were looking for. It may have been moved,
            renamed, or never existed.
          </p>

          {/* Action */}
          <Link
            to={homePath}
            className="
              inline-flex items-center justify-center
              px-6 py-3 rounded-xl
              bg-primary text-primary-foreground
              font-medium text-sm
              hover:bg-primary/90
              transition-colors
              shadow-sm
            "
          >
            Take me back safely
          </Link>
        </div>
      </div>
    </section>
  );
}
