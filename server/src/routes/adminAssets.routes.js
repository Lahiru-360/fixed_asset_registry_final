import express from "express";
import { registerAssetsController } from "../controllers/assets.controller.js";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";
import {
  getAllAssetsController,
  getAssetsPaginatedController,
} from "../controllers/assets.controller.js";

const router = express.Router();

router.post(
  "/requests/:requestId/assets/register",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  registerAssetsController
);

router.get(
  "/assets",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getAllAssetsController
);

router.get(
  "/assets/paginated",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  getAssetsPaginatedController
);

export default router;
