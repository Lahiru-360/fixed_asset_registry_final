import express from "express";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";
import { downloadGRN } from "../controllers/purchaseOrders.controller.js";

import {
  createPurchaseOrder,
  sendPOEmail,
  downloadPOPdf,
  confirmPOReceived,
} from "../controllers/purchaseOrders.controller.js";

const router = express.Router();

router.post(
  "/requests/:requestId/purchase-order",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  createPurchaseOrder
);

router.get(
  "/requests/:requestId/purchase-order/download",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  downloadPOPdf
);

router.post(
  "/requests/:requestId/purchase-order/send-email",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  sendPOEmail
);

router.post(
  "/requests/:requestId/purchase-order/confirm-received",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  confirmPOReceived
);

router.get("/requests/:requestId/purchase-order/grn/download", downloadGRN);

export default router;
