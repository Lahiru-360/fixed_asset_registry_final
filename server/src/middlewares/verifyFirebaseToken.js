import admin from "../config/firebaseAdmin.js";
import { pool } from "../config/db.js";

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing authorization token" });

    const token = header.split(" ")[1];

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decoded;
    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyEmailFirebaseToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing authorization token" });

    const token = header.split(" ")[1];

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // 🔒 Block unverified emails
    if (!decoded.email_verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    req.firebaseUser = decoded;
    // Load employee
    const userRes = await pool.query(
      "SELECT * FROM employees WHERE firebase_uid = $1",
      [decoded.uid]
    );

    if (userRes.rows.length === 0)
      return res.status(401).json({ error: "User not found in database" });

    req.user = userRes.rows[0];

    next();
  } catch (error) {
    console.error("Firebase auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
