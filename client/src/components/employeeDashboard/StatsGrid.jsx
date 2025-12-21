import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";

function Stat({ label, value, variant = "default", icon: Icon }) {
  const variants = {
    default: {
      border: "border-l-muted-foreground",
      text: "text-foreground",
      icon: "text-muted-foreground",
      bg: "bg-muted/50",
    },
    pending: {
      border: "border-l-amber-500",
      text: "text-amber-600 dark:text-amber-500",
      icon: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    approved: {
      border: "border-l-green-600",
      text: "text-green-600 dark:text-green-500",
      icon: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    completed: {
      border: "border-l-blue-500",
      text: "text-blue-600 dark:text-blue-500",
      icon: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    rejected: {
      border: "border-l-red-500",
      text: "text-red-600 dark:text-red-500",
      icon: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`
        ${style.bg} p-5 rounded-2xl border border-muted
        
        flex items-center justify-between gap-4
        transition-all duration-200 hover:shadow-md
      `}
    >
      <div className="flex-1">
        <div className="text-sm text-muted-foreground font-medium mb-1">
          {label}
        </div>
        <div className={`text-3xl font-bold ${style.text}`}>{value ?? 0}</div>
      </div>
      {Icon && (
        <div className={`${style.icon} opacity-80`}>
          <Icon className="w-8 h-8" strokeWidth={2} />
        </div>
      )}
    </div>
  );
}

export default function StatsGrid({ stats }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Stat
        label="Total Requests"
        value={stats.total}
        variant="default"
        icon={FileText}
      />
      <Stat
        label="Pending"
        value={stats.pending}
        variant="pending"
        icon={Clock}
      />
      <Stat
        label="Approved This Month"
        value={stats.approvedThisMonth}
        variant="approved"
        icon={TrendingUp}
      />

      <Stat
        label="Rejected"
        value={stats.rejected}
        variant="rejected"
        icon={XCircle}
      />
      <Stat
        label="Completed"
        value={stats.completed}
        variant="completed"
        icon={CheckCircle2}
      />
    </div>
  );
}
