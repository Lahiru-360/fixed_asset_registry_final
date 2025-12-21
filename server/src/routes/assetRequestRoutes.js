// src/routes/assetRequestRoutes.js
import express from "express";
import {
  createRequest,
  getMyRequests,
  getStats,
} from "../controllers/assetRequestController.js";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyEmailFirebaseToken, createRequest);
router.get("/", verifyEmailFirebaseToken, getMyRequests);
router.get("/stats", verifyEmailFirebaseToken, getStats);

export default router;
