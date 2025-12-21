import express from "express";
import { getDepreciationSummary } from "../controllers/depreciation.controller.js";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import {
  getMonthlyDepreciation,
  downloadMonthlyDepreciationPDF,
} from "../controllers/depreciationMonthly.controller.js";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/monthly",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getMonthlyDepreciation
);

router.get(
  "/monthly/pdf",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  downloadMonthlyDepreciationPDF
);

router.get(
  "/",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getDepreciationSummary
);

export default router;
