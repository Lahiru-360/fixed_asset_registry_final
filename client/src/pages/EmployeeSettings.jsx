import { Settings, Wrench, Sparkles } from "lucide-react";
import EmployeeLayout from "../layout/EmployeeLayout";

export default function SettingsPage() {
  return (
    <EmployeeLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
        <div className="text-center max-w-md px-6">
          {/* Icon Container */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Background Circle */}
            <div className="absolute w-32 h-32 bg-primary/10 rounded-full animate-pulse"></div>

            {/* Icon Group */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Settings className="w-12 h-12 text-primary" strokeWidth={2} />
              </div>

              {/* Floating Icons */}
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center animate-bounce">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center"
                style={{ animation: "bounce 2s infinite 0.5s" }}
              >
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Settings Coming Soon
          </h1>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            We're working on bringing you powerful customization options. Stay
            tuned!
          </p>

          {/* Feature Preview */}
          <div className="bg-muted border border-muted rounded-xl p-5 text-left">
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
              Upcoming Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Profile customization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Notification preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Theme options
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Security settings
              </li>
            </ul>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
