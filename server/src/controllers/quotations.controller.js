import {
  getRequestSummaryModel,
  getQuotationsByRequestIdModel,
  createQuotationModel,
  getQuotationByIdModel,
  selectFinalQuotationModel,
  updateQuotationModel,
  deleteQuotationModel,
} from "../models/quotations.model.js";
import path from "path";
import fs from "fs";

async function ensureRequestIsNotLocked(requestId) {
  const reqRow = await getRequestSummaryModel(requestId);

  if (!reqRow) throw new Error("NOT_FOUND");

  if (reqRow.status === "Quotation Selected") throw new Error("LOCKED");

  return reqRow;
}

// -----------------------------
// GET request summary
// -----------------------------
export async function getRequestSummary(req, res) {
  const { id } = req.params;

  try {
    const request = await getRequestSummaryModel(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json({ request });
  } catch (err) {
    console.error("Request summary error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// -----------------------------
// GET quotations for a request
// -----------------------------
export async function getQuotations(req, res) {
  const { id } = req.params;

  try {
    const quotations = await getQuotationsByRequestIdModel(id);
    return res.json({ quotations });
  } catch (err) {
    console.error("Get quotations error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// -----------------------------
// UPLOAD quotation
// -----------------------------
export async function uploadQuotation(req, res) {
  const { id } = req.params;

  try {
    await ensureRequestIsNotLocked(id);
  } catch (err) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ error: "Request not found" });

    if (err.message === "LOCKED")
      return res.status(403).json({
        error: "A final quotation is already selected. Uploading is locked.",
      });
  }

  const { vendor_name, vendor_email, asset_name, price } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const fileUrl = `/api/files/${req.file.filename}`;

    const quotation = await createQuotationModel(
      id,
      vendor_name,
      vendor_email,
      asset_name,
      price,
      fileUrl
    );

    return res.json({ quotation });
  } catch (err) {
    console.error("Upload quotation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function selectFinalQuotation(req, res) {
  const { id, quotationId } = req.params;

  try {
    await ensureRequestIsNotLocked(id);
  } catch (err) {
    if (err.message === "LOCKED")
      return res
        .status(403)
        .json({ error: "Final quotation already selected." });
  }

  try {
    const exists = await getQuotationByIdModel(quotationId);

    if (!exists) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    await selectFinalQuotationModel(id, quotationId);

    return res.json({ message: "Final quotation selected" });
  } catch (err) {
    console.error("Select quotation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateQuotation(req, res) {
  const { quotationId } = req.params;

  const { vendor_name, vendor_email, asset_name, price } = req.body;

  try {
    const existing = await getQuotationByIdModel(quotationId);
    if (!existing) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    try {
      await ensureRequestIsNotLocked(existing.request_id);
    } catch (err) {
      if (err.message === "LOCKED")
        return res
          .status(403)
          .json({ error: "Cannot edit. Final quotation already selected." });
    }

    let fileUrl = null;

    if (req.file) {
      // If a new file was uploaded, delete old file
      const oldFile = existing.file_url.replace("/api/files/", "");
      const oldPath = path.join(process.cwd(), "uploads", oldFile);

      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      fileUrl = `/api/files/${req.file.filename}`;
    }

    const updatedQuotation = await updateQuotationModel(
      quotationId,
      vendor_name,
      vendor_email,
      asset_name,
      price,
      fileUrl
    );

    return res.json({ quotation: updatedQuotation });
  } catch (err) {
    console.error("Update quotation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function deleteQuotation(req, res) {
  const { quotationId } = req.params;

  try {
    const existing = await getQuotationByIdModel(quotationId);
    if (!existing)
      return res.status(404).json({ error: "Quotation not found" });

    // stop if locked
    try {
      await ensureRequestIsNotLocked(existing.request_id);
    } catch (err) {
      if (err.message === "LOCKED")
        return res
          .status(403)
          .json({ error: "Cannot delete. Final quotation already selected." });
    }

    const deleted = await deleteQuotationModel(quotationId);

    if (!deleted) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    const filename = deleted.file_url.replace("/api/files/", "");
    const filepath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    return res.json({ message: "Quotation deleted" });
  } catch (err) {
    console.error("Delete quotation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
