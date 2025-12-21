// all routes transferred to adminQuotations.route.js

import express from "express";
const router = express.Router();

import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";

import upload from "../middlewares/upload.js";

import {
  getRequestSummary,
  getQuotations,
  uploadQuotation,
  selectFinalQuotation,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotations.controller.js";

// Get request summary
router.get(
  "/requests/:id",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getRequestSummary
);

// Get all quotations for a request
router.get(
  "/requests/:id/quotations",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getQuotations
);

// Upload new quotation
router.post(
  "/requests/:id/quotations",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  upload.single("file"),
  uploadQuotation
);

// Select final quotation
router.post(
  "/requests/:id/quotations/:quotationId/select",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  selectFinalQuotation
);

router.patch(
  "/quotations/:quotationId",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  upload.single("file"),
  updateQuotation
);

router.delete(
  "/quotations/:quotationId",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  deleteQuotation
);

export default router;
