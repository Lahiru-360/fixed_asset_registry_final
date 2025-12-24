import { X, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import { useState } from "react";
import { toast } from "react-toastify";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function NewRequestDrawer({ open, setOpen, onCreated }) {
  const [asset, setAsset] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!asset.trim()) {
      newErrors.asset = "Asset name is required";
    } else if (asset.trim().length < 3) {
      newErrors.asset = "Asset name must be at least 3 characters";
    }

    if (quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/requests", {
        asset_name: asset,
        quantity,
        reason,
      });
      if (onCreated) onCreated();

      // Reset form
      setAsset("");
      setQuantity(1);
      setReason("");
      setErrors({});
      setOpen(false);
    } catch (err) {
      toast.error("Error submitting request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssetChange = (e) => {
    setAsset(e.target.value);
    if (errors.asset) {
      setErrors({ ...errors, asset: "" });
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
    if (errors.quantity) {
      setErrors({ ...errors, quantity: "" });
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 bg-black"
              onClick={() => setOpen(false)}
            />

            {/* DRAWER */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              className="w-full md:w-[520px] bg-background border-l border-muted p-6 overflow-auto shadow-xl"
              style={{
                backgroundColor: `hsl(var(--background))`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  New Asset Request
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instruction Banner */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">
                      Be Specific for Faster Approval
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                      Provide detailed asset names to increase approval chances.
                      For example, instead of "Laptop," use "MSI Cyborg 15 12VE"
                      or "Dell XPS 13 9310."
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitClick} className="space-y-5">
                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={asset}
                    onChange={handleAssetChange}
                    placeholder="e.g., MSI Cyborg 15 12VE, iPhone 15 Pro Max"
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                      errors.asset
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.asset && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.asset}</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={handleQuantityChange}
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground focus:outline-none focus:ring-0 ${
                      errors.quantity
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.quantity && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.quantity}</span>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why do you need this asset?"
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border-2 border-muted focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 resize-none"
                    rows={5}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmedSubmit}
        title="Confirm Request Submission"
        message="Please review your request carefully. Once submitted, this request cannot be deleted or modified."
        confirmText="Submit Request"
        cancelText="Go Back"
        variant="warning"
      >
        {/* Request Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="text-muted-foreground">Asset:</span>
            <span className="font-semibold text-foreground ml-10">{asset}</span>
          </div>
          <div className="flex">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-semibold text-foreground ml-6">
              {quantity}
            </span>
          </div>
          {reason && (
            <div className="pt-2 border-t border-muted">
              <span className="text-muted-foreground block mb-1">Reason:</span>
              <p className="text-foreground">{reason}</p>
            </div>
          )}
        </div>
      </ConfirmationModal>
    </>
  );
}
