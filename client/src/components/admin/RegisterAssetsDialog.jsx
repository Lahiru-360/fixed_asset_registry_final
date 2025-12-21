import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { X, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterAssetsDialog({
  open,
  onClose,
  po,
  onRegistered,
}) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [assetName, setAssetName] = useState(po.asset_name);
  const [department, setDepartment] = useState("");

  const departments = [
    "Finance",
    "IT",
    "Human Resources",
    "Operations",
    "Procurement",
    "Facilities",
    "Administration",
  ];

  const [usefulLife, setUsefulLife] = useState("");
  const [residualValue, setResidualValue] = useState(0);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const res = await axiosInstance.get("/api/admin/categories");
      setCategories(res.data.categories);
    };

    load();
  }, [open]);

  const handleCategorySelect = (id) => {
    setCategoryId(id);
    if (errors.categoryId) {
      setErrors({ ...errors, categoryId: "" });
    }

    const cat = categories.find((c) => c.category_id === Number(id));
    if (cat) {
      setUsefulLife(cat.useful_life);
      setResidualValue(cat.residual_value ?? 0);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!categoryId) {
      newErrors.categoryId = "Please select a category";
    }
    if (!assetName.trim()) {
      newErrors.assetName = "Asset name is required";
    }
    if (!usefulLife || usefulLife <= 0) {
      newErrors.usefulLife = "Valid useful life is required";
    }
    if (!department.trim()) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(
        `/api/admin/requests/${po.request_id}/assets/register`,
        {
          category_id: categoryId,
          asset_name: assetName,
          useful_life: Number(usefulLife),
          residual_value: Number(residualValue),
          department: department,
        }
      );

      onRegistered();
    } catch (error) {
      console.error("Failed to register assets:", error);
      alert("Failed to register assets");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "assetName":
        setAssetName(value);
        break;
      case "usefulLife":
        setUsefulLife(value);
        break;
      case "residualValue":
        setResidualValue(value);
        break;
      case "department":
        setDepartment(value);
        break;
      default:
        break;
    }
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
            className="absolute inset-[-100px] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-background border border-muted rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-muted/50 border-b border-muted px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Register Assets
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Creating <strong>{po.quantity}</strong> asset record(s)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground focus:outline-none focus:ring-0 ${
                    errors.categoryId
                      ? "border-red-500 focus:border-red-500"
                      : "border-muted focus:border-primary"
                  }`}
                  value={categoryId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.categoryId}</span>
                  </div>
                )}
              </div>

              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 ${
                    errors.assetName
                      ? "border-red-500 focus:border-red-500"
                      : "border-muted focus:border-primary"
                  }`}
                  value={assetName}
                  onChange={(e) =>
                    handleFieldChange("assetName", e.target.value)
                  }
                  placeholder="e.g., Dell Laptop XPS 15"
                />
                {errors.assetName && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.assetName}</span>
                  </div>
                )}
              </div>

              {/* Grid for financial details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Useful Life */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Useful Life (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground focus:outline-none focus:ring-0 ${
                      errors.usefulLife
                        ? "border-red-500 focus:border-red-500"
                        : "border-muted focus:border-primary"
                    }`}
                    value={usefulLife}
                    onChange={(e) =>
                      handleFieldChange("usefulLife", e.target.value)
                    }
                    min="0"
                  />
                  {errors.usefulLife && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.usefulLife}</span>
                    </div>
                  )}
                </div>
                {/* Residual Value */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Residual Value (LKR)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border-2 border-muted focus:border-primary transition-colors text-foreground focus:outline-none focus:ring-0"
                    value={residualValue}
                    onChange={(e) =>
                      handleFieldChange("residualValue", e.target.value)
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Department <span className="text-red-500">*</span>
                </label>

                <select
                  className={`w-full px-4 py-2.5 rounded-lg bg-muted border-2 transition-colors text-foreground
      focus:outline-none focus:ring-0
      ${
        errors.department
          ? "border-red-500 focus:border-red-500"
          : "border-muted focus:border-primary"
      }`}
                  value={department}
                  onChange={(e) =>
                    handleFieldChange("department", e.target.value)
                  }
                >
                  <option value="" disabled>
                    Select Department
                  </option>

                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {errors.department && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.department}</span>
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
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Register Assets"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
