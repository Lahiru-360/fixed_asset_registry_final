import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

/**
 * Reusable Confirmation Modal
 *
 * @param {boolean} open - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {function} onConfirm - Called when user confirms action
 * @param {string} title - Modal title
 * @param {string} message - Main message/description
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - Visual style: "danger", "warning", "info", "success" (default: "warning")
 * @param {ReactNode} children - Optional additional content (like summary details)
 */
export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  children,
}) {
  const variants = {
    danger: {
      icon: XCircle,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      buttonBg:
        "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
      buttonText: "text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      buttonBg:
        "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700",
      buttonText: "text-white",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      buttonBg:
        "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
      buttonText: "text-white",
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      buttonBg:
        "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      buttonText: "text-white",
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-background border border-muted rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Icon Header */}
            <div
              className={`${config.bgColor} ${config.borderColor} border-b p-6 flex items-center gap-4`}
            >
              <div className={`${config.iconColor}`}>
                <Icon className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {message && (
                <p className="text-muted-foreground leading-relaxed">
                  {message}
                </p>
              )}

              {children && (
                <div className="bg-muted border border-muted rounded-xl p-4">
                  {children}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-lg ${config.buttonBg} ${config.buttonText} transition-colors font-medium shadow-sm`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
