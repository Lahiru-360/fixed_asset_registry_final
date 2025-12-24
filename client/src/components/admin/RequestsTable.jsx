// RequestsTable.jsx (ADMIN VERSION – fully responsive)
import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import ConfirmationModal from "../ui/ConfirmationModal";
import {
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RequestsTable({ data, onRefresh, loading = false }) {
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const requestConfirmation = (id, action) => {
    setPendingAction({ id, action });
    setConfirmOpen(true);
  };

  const handleAction = async (id, action) => {
    setLoadingId(id);
    try {
      await axiosInstance.post(`/api/admin/requests/${id}/${action}`);
      await onRefresh();
    } catch (error) {
      console.error(error);
      alert("Action failed");
    } finally {
      setLoadingId(null);
    }
  };

  const QUOTATION_FUNCTIONS_STATUSES = [
    "Quotation Selected",
    "Purchase Order Sent",
    "Asset Received",
  ];

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
      classes:
        "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400",
      icon: FileText,
    },
    "Purchase Order Sent": {
      classes:
        "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400",
      icon: Send,
    },
    "Asset Received": {
      classes:
        "bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400",
      icon: PackageCheck,
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

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Loading requests data…
      </p>
    );
  }

  if (!data.length) {
    return (
      <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
        <PackageCheck />
        <p>No requests found</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      {/* 📱 MOBILE CARD LAYOUT */}
      <div className="block md:hidden space-y-4 mt-2">
        <AnimatePresence>
          {data.map((req) => (
            <motion.div
              key={req.request_id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-4 bg-background border border-muted rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-foreground">
                  {req.asset_name}
                </h3>
                <StatusBadge status={req.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requester:</span>
                  <span className="font-medium text-foreground">
                    {req.employee_name || req.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium text-foreground">
                    {req.department || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium text-foreground">
                    {req.quantity}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-muted text-xs">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {req.status === "Pending" ? (
                <div className="flex gap-2 justify-end mt-4">
                  <button
                    onClick={() =>
                      requestConfirmation(req.request_id, "approve")
                    }
                    disabled={loadingId === req.request_id}
                    className="px-4 py-2 rounded-lg bg-green-600 dark:bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      requestConfirmation(req.request_id, "reject")
                    }
                    disabled={loadingId === req.request_id}
                    className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              ) : req.status === "Approved" ? (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() =>
                      navigate(`/admin/requests/${req.request_id}/quotations`)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Manage Quotations
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : QUOTATION_FUNCTIONS_STATUSES.includes(req?.status) ? (
                <div className="flex gap-2 justify-end mt-4">
                  <button
                    onClick={() =>
                      navigate(`/admin/requests/${req.request_id}/quotations`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    View
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/admin/requests/${req.request_id}/order`)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Order
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-4 text-xs text-muted-foreground text-center py-2">
                  No actions available
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 💻 DESKTOP TABLE LAYOUT */}
      <table className="hidden md:table w-full min-w-[950px] mt-3 ">
        <thead className="text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            <th className="py-3 text-left">Asset</th>
            <th className="py-3 text-left">Requester</th>
            <th className="py-3 text-left">Department</th>
            <th className="py-3 text-left">Qty</th>
            <th className="py-3 text-left">Status</th>
            <th className="py-3 text-right">Date</th>
            <th className="py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="text-sm">
          {data.map((req) => (
            <tr
              key={req.request_id}
              className="border-b border-muted/30 dark:border-gray-700 hover:bg-background/50 transition-colors"
            >
              <td className="py-3 font-medium text-foreground">
                {req.asset_name}
              </td>
              <td className="py-3 text-foreground">
                {req.employee_name || req.email}
              </td>
              <td className="py-3 text-muted-foreground">
                {req.department || "N/A"}
              </td>
              <td className="py-3 text-muted-foreground">{req.quantity}</td>
              <td className="py-3">
                <StatusBadge status={req.status} />
              </td>
              <td className="py-3 text-right text-muted-foreground">
                {new Date(req.created_at).toLocaleDateString()}
              </td>

              <td className="py-3 text-right">
                {req.status === "Pending" ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        requestConfirmation(req.request_id, "approve")
                      }
                      disabled={loadingId === req.request_id}
                      className="
    inline-flex items-center gap-1.5
    px-3 py-1.5 rounded-md
    text-sm font-medium
    bg-green-600 text-white
    hover:bg-green-700
    focus:outline-none focus:ring-2 focus:ring-green-500/40
    disabled:opacity-50 disabled:cursor-not-allowed
    transition
  "
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        requestConfirmation(req.request_id, "reject")
                      }
                      disabled={loadingId === req.request_id}
                      className="
    inline-flex items-center gap-1.5
    px-3 py-1.5 rounded-md
    text-sm font-medium
    bg-red-600 text-white
    hover:bg-red-700
    focus:outline-none focus:ring-2 focus:ring-red-500/40
    disabled:opacity-50 disabled:cursor-not-allowed
    transition
  "
                    >
                      Reject
                    </button>
                  </div>
                ) : req.status === "Approved" ? (
                  <button
                    onClick={() =>
                      navigate(`/admin/requests/${req.request_id}/quotations`)
                    }
                    className=" inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition"
                  >
                    Manage
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : QUOTATION_FUNCTIONS_STATUSES.includes(req?.status) ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/requests/${req.request_id}/quotations`)
                      }
                      className=" inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition"
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/requests/${req.request_id}/order`)
                      }
                      className=" inline-flex items-center gap-1.5
      px-2.5 py-1.5
      rounded-md
      text-sm font-medium
      text-primary
      border border-primary/30
      hover:bg-primary/10
      hover:border-primary/60
      active:scale-[0.97]
      transition"
                    >
                      Order
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No actions
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onConfirm={() => {
          if (pendingAction) {
            handleAction(pendingAction.id, pendingAction.action);
          }
        }}
        title={
          pendingAction?.action === "approve"
            ? "Approve Request"
            : "Reject Request"
        }
        message={
          pendingAction?.action === "approve"
            ? "Are you sure you want to approve this asset request? This will allow quotation processing to begin."
            : "Are you sure you want to reject this asset request? This action cannot be undone."
        }
        confirmText={
          pendingAction?.action === "approve"
            ? "Approve Request"
            : "Reject Request"
        }
        variant={pendingAction?.action === "approve" ? "success" : "danger"}
      />
    </div>
  );
}
