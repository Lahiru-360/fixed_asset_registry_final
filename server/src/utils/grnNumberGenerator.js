import { pool } from "../config/db.js";

export async function generateProductionGRN() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  // DB sequence for concurrency-safe increments
  const result = await pool.query("SELECT nextval('grn_seq') AS seq");
  const seq = String(result.rows[0].seq).padStart(6, "0");

  return `GRN-${y}${m}${d}-${seq}`;
}
