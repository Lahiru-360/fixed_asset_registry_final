import path from "path";
import fs from "fs";
import {
  createPurchaseOrderModel,
  getPurchaseOrderByRequestIdModel,
  markPOSentModel,
  markPOReceivedModel,
  savePOPdfPathModel,
} from "../models/purchaseOrders.model.js";
import {
  getFinalQuotationModel,
  getRequestSummaryModel,
} from "../models/quotations.model.js";
import { generatePurchaseOrderPDF } from "../utils/generatePOPdf.js";
import { sendPurchaseOrderEmail } from "../utils/sendPOEmail.js";
import {
  createGRNModel,
  getGRNByPOModel,
  getGRNByRequestIdModel,
} from "../models/goodsReceived.model.js";
import { generateGRNPDF } from "../utils/generateGRN.js";
import { generateProductionGRN } from "../utils/grnNumberGenerator.js";
import { generateProductionPO } from "../utils/poNumberGenerator.js";
import { downloadFileAsBuffer } from "../utils/supabaseStorage.js";
import { updateRequestStatus } from "../models/adminRequests.model.js";

// CREATE PO IF NOT EXISTS
export async function createPurchaseOrder(req, res) {
  const { requestId } = req.params;

  try {
    const request = await getRequestSummaryModel(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    const QUOTATION_FUNCTIONS_STATUSES = [
      "Quotation Selected",
      "Purchase Order Sent",
      "Asset Received",
      "Completed",
    ];

    if (!QUOTATION_FUNCTIONS_STATUSES.includes(request.status)) {
      return res.status(403).json({
        error:
          "Cannot generate PO until a quotation is selected or after Request fulfilled.",
      });
    }

    // 1️⃣ Check if PO already exists
    const existingPO = await getPurchaseOrderByRequestIdModel(requestId);
    if (existingPO) {
      const grn = await getGRNByPOModel(existingPO.po_id);

      return res.json({
        po: {
          ...existingPO,
          grn_number: grn?.grn_number || null,
          grn_pdf_path: grn?.pdf_path || null,
          grn_exists: !!grn,
          status: request.status,
        },
      });
    }

    // 2️⃣ Ensure a final quotation exists
    const quotation = await getFinalQuotationModel(requestId);
    if (!quotation) {
      return res.status(400).json({ error: "Final quotation not found." });
    }

    // 3️⃣ Create PO
    await createPurchaseOrderModel({
      request_id: requestId,
      quotation_id: quotation.quotation_id,
      vendor_name: quotation.vendor_name,
      vendor_email: quotation.vendor_email,
      vendor_price: quotation.price,
      asset_name: quotation.asset_name,
      quantity: request.quantity,
      po_number: await generateProductionPO(),
    });

    // 4️⃣ Re-fetch canonical PO (prevents duplicate-return issues)
    const po = await getPurchaseOrderByRequestIdModel(requestId);

    return res.json({
      po: {
        ...po,
        status: request.status,
      },
    });
  } catch (err) {
    console.error("Create PO error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

//  Download PO function
export async function downloadPOPdf(req, res) {
  const { requestId } = req.params;

  const po = await getPurchaseOrderByRequestIdModel(requestId);
  if (!po) {
    return res.status(404).json({ error: "PO not found" });
  }

  // If PDF URL doesn't exist, generate it
  if (!po.pdf_path) {
    const fileUrl = await generatePurchaseOrderPDF(po);
    await savePOPdfPathModel(po.po_id, fileUrl);
    po.pdf_path = fileUrl;
  }

  // Redirect to Supabase Storage URL (if public)
  // Or fetch and serve (if private)
  return res.redirect(po.pdf_path);
}

// Send PO Email function
export async function sendPOEmail(req, res) {
  const { requestId } = req.params;
  const adminId = req.user.employee_id;

  try {
    const po = await getPurchaseOrderByRequestIdModel(requestId);
    if (!po) return res.status(404).json({ error: "PO not found" });

    // Generate PDF if not exists
    if (!po.pdf_path) {
      const fileUrl = await generatePurchaseOrderPDF(po);
      await savePOPdfPathModel(po.po_id, fileUrl);
      po.pdf_path = fileUrl;
    }

    // Extract file name from URL
    const fileName = po.pdf_path.split("/").pop();

    // Download PDF from Supabase Storage for email attachment
    const pdfBuffer = await downloadFileAsBuffer(fileName, "po-pdfs");

    // Update sendPurchaseOrderEmail to accept buffer
    await sendPurchaseOrderEmail(po, pdfBuffer);

    await updateRequestStatus(requestId, "Purchase Order Sent", adminId);
    await markPOSentModel(po.po_id);

    return res.json({ message: "PO sent successfully" });
  } catch (err) {
    console.error("Send PO email error:", err);
    return res.status(500).json({ error: "Server error sending email" });
  }
}

// CONFIRM RECEIVED
export async function confirmPOReceived(req, res) {
  const { requestId } = req.params;
  const adminId = req.user.employee_id;

  try {
    // 1. Load PO
    const po = await getPurchaseOrderByRequestIdModel(requestId);
    if (!po) return res.status(404).json({ error: "PO not found" });

    // 2. Prevent repeating GRN
    const existingGRN = await getGRNByPOModel(po.po_id);
    if (existingGRN) {
      return res.json({
        message: "GRN already exists",
        grn: existingGRN,
      });
    }

    // 3. Generate production-grade GRN number
    const grnNumber = await generateProductionGRN();

    // 4. Mark PO as received
    await markPOReceivedModel(po.po_id);

    await updateRequestStatus(requestId, "Asset Received", adminId);

    // 5. Generate GRN PDF (filename = grnNumber.pdf)
    const pdfPath = await generateGRNPDF(po, grnNumber);

    // 6. Save GRN record
    const grn = await createGRNModel(po.po_id, grnNumber, pdfPath);

    return res.json({
      message: "PO marked as received. GRN generated.",
      grn,
    });
  } catch (err) {
    console.error("Confirm PO Received error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Update downloadGRN function
export async function downloadGRN(req, res) {
  const { requestId } = req.params;

  try {
    const grn = await getGRNByRequestIdModel(requestId);
    if (!grn) return res.status(404).json({ error: "GRN not found" });

    // Redirect to Supabase Storage URL
    return res.redirect(grn.pdf_path);
  } catch (err) {
    console.error("GRN download error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
