import { BarChart3, Sparkles } from "lucide-react";
import AdminLayout from "../layout/AdminLayout";

export default function AdminDashboardOverview() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="text-center max-w-xl px-6">
          {/* Icon Container */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Background Pulse */}
            <div className="absolute w-36 h-36 bg-primary/10 rounded-full animate-pulse"></div>

            {/* Main Icon */}
            <div className="relative">
              <div className="w-28 h-28 bg-primary/20 rounded-3xl flex items-center justify-center">
                <BarChart3 className="w-14 h-14 text-primary" strokeWidth={2} />
              </div>

              {/* Accent Icon */}
              <div className="absolute -bottom-2 -right-2 w-11 h-11 bg-secondary/20 rounded-xl flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Analytics & Insights - <span>Coming Soon</span>
          </h1>

          {/* Core Message (IMPORTANT) */}
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            This system is already fully operational. In the meantime, explore
            our{" "}
            <span className="font-semibold text-foreground">core features</span>{" "}
            and experience what truly sets this platform apart.
          </p>

          {/* Supporting Context */}
          <div className="bg-muted border border-muted rounded-xl p-5 text-left">
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
              Why this matters
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                All operational workflows are live and production-ready
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                This dashboard will soon surface system-wide statistics and
                trends
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary"></div>
                No functionality is blocked or limited by this view
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
