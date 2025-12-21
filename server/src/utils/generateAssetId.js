import { pool } from "../config/db.js";

export async function generateAssetId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  // get next sequence number
  const result = await pool.query("SELECT nextval('asset_seq') AS seq");
  const seq = String(result.rows[0].seq).padStart(6, "0");

  return `AS-${yyyy}${mm}${dd}-${seq}`;
}
