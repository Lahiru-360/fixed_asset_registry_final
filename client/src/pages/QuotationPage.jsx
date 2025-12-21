import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import UploadQuotationDialog from "../components/admin/UploadQuotationDialog";
import QuotationCard from "../components/admin/QuotationCard";
import { ArrowLeft, Upload, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function QuotationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const fetchData = async () => {
    try {
      const reqRes = await axiosInstance.get(`/api/admin/requests/${id}`);
      const quoteRes = await axiosInstance.get(
        `/api/admin/requests/${id}/quotations`
      );
      setRequest(reqRes.data.request);
      setQuotations(quoteRes.data.quotations);
    } catch (err) {
      console.error("Failed to load quotation data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quotationId) => {
    try {
      await axiosInstance.delete(`/api/admin/quotations/${quotationId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to delete quotation:", err);
    }
  };

  const handleEdit = (quotation) => {
    setSelectedQuotation(quotation);
    setEditMode(true);
    setUploadDialogOpen(true);
  };

  const handleSelectQuotation = async (quotationId) => {
    try {
      await axiosInstance.post(
        `/api/admin/requests/${id}/quotations/${quotationId}/select`
      );
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to select quotation");
    }
  };

  const openUploadDialog = () => {
    setSelectedQuotation(null);
    setEditMode(false);
    setUploadDialogOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">
              Loading quotations...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const QUOTATION_ALLOWED_STATUSES = [
    "Approved",
    "Quotation Selected",
    "Purchase Order Sent",
    "Asset Received",
    "Completed",
  ];

  const QUOTATION_FUNCTIONS_STATUSES = [
    "Quotation Selected",
    "Purchase Order Sent",
    "Asset Received",
    "Completed",
  ];

  if (!loading && !QUOTATION_ALLOWED_STATUSES.includes(request?.status)) {
    return <AdminLayout>{navigate("/admin/requests")}</AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Request Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-muted border border-muted rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {request.asset_name}
              </h1>

              {!QUOTATION_FUNCTIONS_STATUSES.includes(request?.status) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
                  <Upload className="w-3.5 h-3.5" />
                  Pending Quotations
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                  <FileCheck className="w-3.5 h-3.5" />
                  Quotation Finalized
                </span>
              )}
            </div>

            {!QUOTATION_FUNCTIONS_STATUSES.includes(request?.status) && (
              <button
                onClick={openUploadDialog}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload Quotation
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-background rounded-xl p-4 border border-muted">
              <div className="text-sm text-muted-foreground mb-1">
                Requested by
              </div>
              <div className="font-semibold text-foreground">
                {request.employee_name}
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-muted">
              <div className="text-sm text-muted-foreground mb-1">
                Department
              </div>
              <div className="font-semibold text-foreground">
                {request.department}
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-muted">
              <div className="text-sm text-muted-foreground mb-1">Quantity</div>
              <div className="font-semibold text-primary text-xl">
                {request.quantity}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quotations Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Submitted Quotations ({quotations.length})
          </h2>

          {quotations.length === 0 ? (
            <div className="bg-muted border border-muted rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No quotations uploaded yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.map((q) => (
                <QuotationCard
                  key={q.quotation_id}
                  quotation={q}
                  request={request}
                  onSelect={() => handleSelectQuotation(q.quotation_id)}
                  onEdit={() => handleEdit(q)}
                  onDelete={() => handleDelete(q.quotation_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upload Dialog */}
        <UploadQuotationDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          requestId={id}
          onUploaded={() => {
            fetchData();
            setUploadDialogOpen(false);
          }}
          editMode={editMode}
          quotation={selectedQuotation}
        />
      </div>
    </AdminLayout>
  );
}
