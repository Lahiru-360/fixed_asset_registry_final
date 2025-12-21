import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/assetCategories.controller.js";

import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", verifyEmailFirebaseToken, requireRole("admin"), getCategories);
router.post(
  "/",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  createCategory
);
router.put(
  "/:id",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  updateCategory
);
router.delete(
  "/:id",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  deleteCategory
);

export default router;
