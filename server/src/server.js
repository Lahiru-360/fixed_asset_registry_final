console.log("BOOT STEP 1: file loaded");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsOptions } from "./config/corsOptions.js";
import authRoutes from "./routes/authRoutes.js";
import assetRequestRoutes from "./routes/assetRequestRoutes.js";
import adminRequestRoutes from "./routes/adminRequests.routes.js";
import adminPurchaseOrder from "./routes/adminPurchaseOrder.routes.js";
import adminAssetsRoutes from "./routes/adminAssets.routes.js";
import adminAssetsCategories from "./routes/assetCategories.routes.js";
import adminDepreciationRoutes from "./routes/adminDepreciation.routes.js";
import SOFPRoutes from "./routes/adminSOFP.routes.js";

dotenv.config();

const app = express();

// Use modular CORS
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// Health check endpoint (for Heroku)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", assetRequestRoutes);
app.use("/api/admin/categories", adminAssetsCategories);
app.use("/api/admin/depreciation", adminDepreciationRoutes);
app.use("/api/admin/sofp", SOFPRoutes);
app.use("/api/admin", adminRequestRoutes);
app.use("/api/admin", adminPurchaseOrder);
app.use("/api/admin", adminAssetsRoutes);

console.log("BOOT STEP 2: about to listen");
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
