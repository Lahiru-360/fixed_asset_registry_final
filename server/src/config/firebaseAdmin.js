/* import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Parse service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
*/

import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT missing in Heroku Config Vars");
}

const serviceAccount = JSON.parse(raw.replace(/\\n/g, "\n"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
