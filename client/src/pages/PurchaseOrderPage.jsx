// PurchaseOrderPage.jsx – Professional Design

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import AdminLayout from "../layout/AdminLayout";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import {
  ArrowLeft,
  Download,
  Send,
  PackageCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegisterAssetsDialog from "../components/admin/RegisterAssetsDialog";

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

    console.log(res.data.po);

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
      alert("Failed to send email");
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
          onClick={() => window.history.back()}
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
            <Step
              label="PO Created"
              icon="file-check"
              active={true}
              completed={true}
            />
            <Line active={po.sent} />

            <Step
              label="Sent"
              icon="send"
              active={po.sent}
              completed={po.sent}
            />
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
            <Line active={po.status == "Completed" ? true : false} />

            <Step
              label="Registry"
              icon="library"
              active={po.status == "Completed" ? true : false}
              completed={po.status == "Completed" ? true : false}
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
              Review PO details{" "}
              {po.status !== "Completed" ? <>and manage order status</> : null}
            </p>
          </div>

          {/* PO Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* PO Details */}
            <div className="bg-background rounded-xl p-5 border border-muted">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                PO Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="font-medium text-foreground">
                    {po.po_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset:</span>
                  <span className="font-medium text-foreground">
                    {po.asset_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-semibold text-primary text-lg">
                    {po.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold text-primary text-lg">
                    LKR {po.vendor_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Information */}
            <div className="bg-background rounded-xl p-5 border border-muted">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Vendor Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="font-medium text-foreground">
                    {po.vendor_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">
                    {po.vendor_email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!po.sent ? (
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Purchase Order to Vendor
                  </>
                )}
              </button>
            ) : po.status !== "Completed" ? (
              <button
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg font-medium cursor-not-allowed border border-green-200 dark:border-green-800"
                disabled
              >
                <PackageCheck className="w-4 h-4" />
                Purchase Order Sent
              </button>
            ) : null}

            <button
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              onClick={downloadPDF}
            >
              <Download className="w-4 h-4" />
              Download Purchase Order (PDF)
            </button>

            {po.sent &&
              (!po.received ? (
                <button
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-green-600 dark:bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
                  onClick={() => setConfirmReceiveOpen(true)}
                >
                  <PackageCheck className="w-4 h-4" />
                  Confirm Receipt & Generate GRN
                </button>
              ) : (
                <>
                  <button
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                    onClick={downloadGRN}
                  >
                    <Download className="w-4 h-4" />
                    Download GRN (PDF)
                  </button>
                  {po.status !== "Completed" ? (
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                      onClick={() => setRegisterOpen(true)}
                    >
                      <FileText className="w-4 h-4" />
                      Register Asset
                    </button>
                  ) : null}
                </>
              ))}
          </div>
        </div>
        <ConfirmationModal
          open={confirmReceiveOpen}
          onClose={() => setConfirmReceiveOpen(false)}
          onConfirm={confirmReceived}
          title="Confirm Asset Receipt"
          message={
            <>
              You are about to confirm that the ordered items have been
              received.
              <br />
              <br />
              This will generate the GRN and this action cannot be undone.
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

/* Stepper Components */
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
    <div className="flex flex-col items-center text-center min-w-[80px] flex-shrink-0">
      <div
        className={`flex items-center justify-center rounded-full border-2 transition w-10 h-10 ${
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
      <span
        className={`mt-2 text-xs font-medium ${
          active || completed ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Line({ active }) {
  return (
    <div
      className={`flex-1 h-0.5 mx-2 transition-colors ${
        active ? "bg-primary" : "bg-muted"
      }`}
    ></div>
  );
}
