import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { X, Upload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function UploadQuotationDialog({
  open,
  onClose,
  requestId,
  onUploaded,
  editMode = false,
  quotation = null,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [vendor, setVendor] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editMode && quotation) {
      setVendor(quotation.vendor_name);
      setEmail(quotation.vendor_email);
      setPrice(quotation.price);
      setAssetName(quotation.asset_name || "");
    }

    if (!open) {
      setVendor("");
      setEmail("");
      setPrice("");
      setAssetName("");
      setFile(null);
      setErrors({});
    }
  }, [editMode, open, quotation]);

  const validate = () => {
    const newErrors = {};

    if (!vendor.trim()) {
      newErrors.vendor = "Vendor name is required";
    }

    if (!assetName.trim()) {
      newErrors.assetName = "Asset name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Vendor email is required";
    }

    if (!price || price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!editMode && !file) {
      newErrors.file = "Please upload a quotation file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append("vendor_name", vendor);
    formData.append("vendor_email", email);
    formData.append("asset_name", assetName);
    formData.append("price", price);
    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);

      if (editMode) {
        await axiosInstance.patch(
          `/api/admin/quotations/${quotation.quotation_id}`,
          formData
        );
      } else {
        await axiosInstance.post(
          `/api/admin/requests/${requestId}/quotations`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      onUploaded();
      onClose();
      setVendor("");
      setPrice("");
      setEmail("");
      setFile(null);
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("Failed to upload quotation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (e) => {
    e.preventDefault(); // stop form submit
    if (!validate()) {
      return;
    }
    setConfirmOpen(true);
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "vendor":
        setVendor(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "price":
        setPrice(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              //className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              className="absolute inset-[-100px] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-background border border-muted rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-muted/50 border-b border-muted px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {editMode ? "Edit Quotation" : "Upload Quotation"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {editMode
                      ? "Update vendor details"
                      : "Add vendor quotation details"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="p-6 space-y-5 overflow-y-auto overscroll-contain"
              >
                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Asset Name <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      (exactly as stated in the quotation)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => {
                      if (errors.assetName) {
                        setErrors({ ...errors, assetName: "" });
                      }
                      setAssetName(e.target.value);
                    }}
                    placeholder="e.g., Dell Latitude 7420"
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                      errors.assetName
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.assetName && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.assetName}</span>
                    </div>
                  )}
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) =>
                      handleFieldChange("vendor", e.target.value)
                    }
                    placeholder="e.g., Tech Solutions Ltd."
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                      errors.vendor
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.vendor && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.vendor}</span>
                    </div>
                  )}
                </div>

                {/* Vendor Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vendor Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="vendor@example.com"
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit Price (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                      errors.price
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                  />
                  {errors.price && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.price}</span>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quotation File{" "}
                    {!editMode && <span className="text-red-500">*</span>}
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      errors.file
                        ? "border-red-500 bg-red-50 dark:bg-red-950/10"
                        : "border-muted bg-muted/30 hover:border-primary"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        errors.file ? "text-red-500" : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-sm text-muted-foreground mb-2">
                      {file ? (
                        <span className="font-medium text-foreground">
                          {file.name}
                        </span>
                      ) : editMode ? (
                        "Upload new file (optional)"
                      ) : (
                        "Upload PDF, PNG, JPG or JPEG"
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        setFile(e.target.files[0]);
                        if (errors.file) {
                          setErrors({ ...errors, file: "" });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.file && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.file}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-5 py-2.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {editMode ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleUpdateClick}
                      className="flex-1 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Uploading..." : "Update"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Uploading..." : "Upload"}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Update Quotation"
        message={
          <>
            Are you sure you want to update this quotation?
            <br />
            This will overwrite the existing details.
          </>
        }
        confirmText="Update"
        variant="warning"
      />
    </>
  );
}
