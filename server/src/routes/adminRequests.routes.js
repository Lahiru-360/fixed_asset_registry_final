import express from "express";
const router = express.Router();

import {
  getRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/adminRequests.controller.js";

import { requireRole } from "../middlewares/auth.js";

import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";

import upload from "../middlewares/upload.js";

import {
  getRequestSummary,
  getQuotations,
  uploadQuotation,
  selectFinalQuotation,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotations.controller.js";

router.get(
  "/requests",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getRequests
);

router.post(
  "/requests/:id/approve",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  approveRequest
);

router.post(
  "/requests/:id/reject",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  rejectRequest
);

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
