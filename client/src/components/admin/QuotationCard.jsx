import { FileText, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";
import ConfirmationModal from "../ui/ConfirmationModal";
import { useState } from "react";

export default function QuotationCard({
  quotation,
  onSelect,
  onEdit,
  request,
  onDelete,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpenDup, setConfirmOpenDup] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isSelectLoading, setIsSelectLoading] = useState(false);

  const viewFile = async () => {
    try {
      const response = await axiosInstance.get(quotation.file_url, {
        responseType: "blob", // IMPORTANT
      });

      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open file:", err);
      alert("Could not open the file");
    }
  };

  const QUOTATION_FUNCTIONS_STATUSES = [
    "Quotation Selected",
    "Purchase Order Sent",
    "Asset Recieved",
    "Completed",
  ];

  const isFinalized = QUOTATION_FUNCTIONS_STATUSES.includes(request?.status);

  const handleDeleteClick = async () => {
    setIsDeleteLoading(true);
    try {
      await onDelete();
    } finally {
      setIsDeleteLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleSelectClick = async () => {
    setIsSelectLoading(true);
    try {
      await onSelect();
    } finally {
      setIsSelectLoading(false);
      setConfirmOpenDup(false);
    }
  };

  const isSelectedQuotation = Boolean(quotation?.is_final);

  const cardClasses = `bg-background rounded-xl p-5 hover:shadow-md transition-shadow border ${
    isSelectedQuotation
      ? "border-primary ring-2 ring-primary/30 shadow-lg"
      : "border-muted"
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClasses}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground inline m-0">
              {quotation.vendor_name}
            </h3>
            <span className="text-lg text-muted-foreground">-</span>
            <h3 className="text-lg text-muted-foreground inline m-0">
              {quotation.asset_name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {quotation.vendor_email}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isSelectedQuotation && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> Finalized
            </span>
          )}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Unit Price</div>
            <div className="text-xl font-bold text-primary">
              LKR {Number(quotation.price).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded {new Date(quotation.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            onClick={viewFile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            View File
          </button>

          {!isFinalized && (
            <>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => setConfirmOpen(true)}
                disabled={isDeleteLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleteLoading ? (
                  <>
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
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>

              <button
                onClick={() => setConfirmOpenDup(true)}
                disabled={isSelectLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSelectLoading ? (
                  <>
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
                    Finalizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Select as Final
                  </>
                )}
              </button>
            </>
          )}
          <ConfirmationModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDeleteClick}
            title="Delete Asset"
            message={
              <>
                Are you sure you want to delete this Quotation?
                <br />
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
            variant="danger"
          />
          <ConfirmationModal
            open={confirmOpenDup}
            onClose={() => setConfirmOpenDup(false)}
            onConfirm={handleSelectClick}
            title="Finalize Quotation"
            message={
              <>
                Are you sure you want to select this quotation as the final
                choice?
                <br />
                Once confirmed, you will not be able to modify this quotation or
                upload any new quotations for this request.
              </>
            }
            confirmText="Finalize"
            variant="warning"
          />
        </div>
      </div>
    </motion.div>
  );
}
