import express from "express";
import fs from "fs";
import path from "path";
import { verifyEmailFirebaseToken } from "../middlewares/verifyFirebaseToken.js";
import { requireRole } from "../middlewares/auth.js";
import mime from "mime-types"; // add this at top

const router = express.Router();

// Protect file serving
router.get(
  "/:filename",
  verifyEmailFirebaseToken,
  requireRole("admin"),
  (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(process.cwd(), "uploads", filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Detect file type automatically
    const contentType = mime.lookup(filepath) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    res.sendFile(filepath);
  }
);

export default router;
