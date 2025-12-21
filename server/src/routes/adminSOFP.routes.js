import express from "express";
import { getSOFP, downloadSOFPPDF } from "../controllers/sofp.controller.js";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyEmailFirebaseToken, requireRole("admin"), getSOFP);
router.get(
  "/pdf",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  downloadSOFPPDF
);

export default router;
