/*import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Parse service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;*/
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build absolute path to serviceAccountKey.json
const serviceAccountPath = path.resolve(
  __dirname,
  "../../",
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);

// Debug logs (remove once tested)
console.log("🔥 ENV:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
console.log("🔥 PATH:", serviceAccountPath);

// Read the JSON file manually instead of using import()
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
