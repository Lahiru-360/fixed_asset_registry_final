// RequestsTable.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
} from "lucide-react";

export default function RequestsTable({ data = [] }) {
  const statusConfig = {
    Pending: {
      classes:
        "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
      icon: Clock,
    },
    Approved: {
      classes:
        "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400",
      icon: CheckCircle2,
    },
    Rejected: {
      classes: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400",
      icon: XCircle,
    },
    Completed: {
      classes:
        "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400",
      icon: CheckCircle2,
    },
    "Quotation Selected": {
      classes: "bg-muted text-muted-foreground",
      icon: FileText,
    },
    "Purchase Order Sent": {
      classes: "bg-muted text-muted-foreground",
      icon: Send,
    },
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || {
      classes: "bg-muted text-muted-foreground",
      icon: PackageCheck,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.classes}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  if (!data) {
    return <div className="py-6 text-center">Loading requests...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
        <PackageCheck />
        <p>No requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      {/* Mobile card layout */}
      <div className="block md:hidden space-y-4 mt-2">
        <AnimatePresence>
          {data.map((r) => (
            <motion.div
              key={r.request_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 bg-background border border-muted rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{r.asset_name}</h3>
                <StatusBadge status={r.status} />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Qty:</strong> {r.quantity}
                </p>
                {r.reason && (
                  <p>
                    <strong>Reason:</strong> {r.reason}
                  </p>
                )}
                <p className="mt-1">
                  <strong>Date:</strong>{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop table layout */}
      <table className="hidden md:table w-full min-w-[720px] mt-3">
        <thead className="text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            <th className="py-3 text-left">Asset</th>
            <th className="py-3 text-left">Quantity</th>
            <th className="py-3 text-left">Reason</th>
            <th className="py-3 text-left">Status</th>
            <th className="py-3 text-right">Date</th>
          </tr>
        </thead>

        <tbody className="text-sm">
          {data.map((r) => (
            <tr
              key={r.request_id}
              className="border-b border-muted/30 dark:border-gray-700 hover:bg-background/50"
            >
              <td className="py-3">{r.asset_name}</td>
              <td className="py-3 text-muted-foreground">{r.quantity}</td>
              <td className="py-3">{r.reason ? r.reason : "-"}</td>
              <td className="py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="py-3 text-right">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
