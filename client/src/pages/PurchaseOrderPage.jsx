// PurchaseOrderPage.jsx – Final Cleaned Version (Email decoupled)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AdminLayout from "../layout/AdminLayout";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import RegisterAssetsDialog from "../components/admin/RegisterAssetsDialog";
import {
  ArrowLeft,
  Download,
  Send,
  PackageCheck,
  FileText,
} from "lucide-react";

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [confirmReceiveOpen, setConfirmReceiveOpen] = useState(false);

  const load = async () => {
    const res = await axiosInstance.post(
      `/api/admin/requests/${id}/purchase-order`
    );
    setPo(res.data.po);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sendEmail = async () => {
    setSendingEmail(true);
    try {
      await axiosInstance.post(
        `/api/admin/requests/${id}/purchase-order/send-email`
      );
      await load();
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setSendingEmail(false);
    }
  };

  const downloadPDF = async () => {
    const res = await axiosInstance.get(
      `/api/admin/requests/${id}/purchase-order/download`,
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${po.po_number}.pdf`;
    a.click();
    a.remove();
  };

  const confirmReceived = async () => {
    await axiosInstance.post(
      `/api/admin/requests/${id}/purchase-order/confirm-received`
    );
    load();
  };

  const downloadGRN = async () => {
    const res = await axiosInstance.get(
      `/api/admin/requests/${id}/purchase-order/grn/download`,
      { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${po.grn_number}.pdf`;
    a.click();
    a.remove();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">
              Loading purchase order...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Progress Stepper */}
        <div className="hidden md:block bg-muted border border-muted rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Order Progress
          </h3>
          <div className="flex items-center justify-between relative overflow-x-auto">
            <Step label="PO Created" icon="file-check" active completed />
            <Line active />
            <Step label="Sent" icon="send" active completed />
            <Line active={po.received} />
            <Step
              label="Received"
              icon="package-check"
              active={po.received}
              completed={po.received}
            />
            <Line active={po.received} />
            <Step
              label="GRN Generated"
              icon="clipboard-list"
              active={po.received}
              completed={po.received}
            />
            <Line active={po.status === "Completed"} />
            <Step
              label="Registry"
              icon="library"
              active={po.status === "Completed"}
              completed={po.status === "Completed"}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-muted border border-muted rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              Purchase Order
            </h1>
            <p className="text-muted-foreground mt-1">
              Review PO details and manage order status
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* PO Details */}
            <div className="bg-background rounded-xl p-5 border border-muted">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                PO Details
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="PO Number" value={po.po_number} />
                <InfoRow label="Asset" value={po.asset_name} />
                <InfoRow
                  label="Quantity"
                  value={
                    <span className="text-primary font-semibold text-lg">
                      {po.quantity}
                    </span>
                  }
                />
                <InfoRow
                  label="Price"
                  value={
                    <span className="text-primary font-semibold text-lg">
                      LKR {po.vendor_price.toLocaleString()}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Vendor Info */}
            <div className="bg-background rounded-xl p-5 border border-muted">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                Vendor Information
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Vendor" value={po.vendor_name} />
                <InfoRow label="Email" value={po.vendor_email} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Send Email (disabled) */}
            <button
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-not-allowed opacity-60"
              disabled
              title="Email sending temporarily disabled"
            >
              <Send className="w-4 h-4" />
              Send Purchase Order to Vendor
            </button>

            <button
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
              onClick={downloadPDF}
            >
              <Download className="w-4 h-4" />
              Download Purchase Order (PDF)
            </button>

            {!po.received ? (
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                onClick={() => setConfirmReceiveOpen(true)}
              >
                <PackageCheck className="w-4 h-4" />
                Confirm Receipt & Generate GRN
              </button>
            ) : (
              <>
                <button
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80"
                  onClick={downloadGRN}
                >
                  <Download className="w-4 h-4" />
                  Download GRN (PDF)
                </button>
                {po.status !== "Completed" && (
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                    onClick={() => setRegisterOpen(true)}
                  >
                    <FileText className="w-4 h-4" />
                    Register Asset
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <ConfirmationModal
          open={confirmReceiveOpen}
          onClose={() => setConfirmReceiveOpen(false)}
          onConfirm={confirmReceived}
          title="Confirm Asset Receipt"
          message={
            <>
              You are about to confirm receipt. This will generate the GRN and
              cannot be undone.
            </>
          }
          confirmText="Confirm & Generate GRN"
          cancelText="Cancel"
          variant="success"
        />

        <RegisterAssetsDialog
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          po={po}
          onRegistered={() => {
            load();
            setRegisterOpen(false);
          }}
        />
      </div>
    </AdminLayout>
  );
}

/* Helpers */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* Stepper */
import {
  Check,
  FileCheck,
  Send as SendIcon,
  PackageCheck as PackageCheckIcon,
  ClipboardList,
  Library,
} from "lucide-react";

const icons = {
  "file-check": FileCheck,
  send: SendIcon,
  "package-check": PackageCheckIcon,
  "clipboard-list": ClipboardList,
  library: Library,
};

function Step({ label, icon, active, completed }) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center min-w-[80px]">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition ${
          completed
            ? "bg-primary border-primary text-primary-foreground"
            : active
            ? "border-primary text-primary bg-primary/10"
            : "border-muted text-muted-foreground bg-muted/30"
        }`}
      >
        {completed ? (
          <Check className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <span className="mt-2 text-xs font-medium">{label}</span>
    </div>
  );
}

function Line({ active }) {
  return (
    <div
      className={`flex-1 h-0.5 mx-2 ${active ? "bg-primary" : "bg-muted"}`}
    />
  );
}
