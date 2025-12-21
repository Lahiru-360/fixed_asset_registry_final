import { pool } from "../config/db.js";

export async function generateProductionPO() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");

  // DB sequence ensures concurrency-safe increments
  const result = await pool.query("SELECT nextval('po_seq') AS seq");
  const seq = String(result.rows[0].seq).padStart(6, "0");

  return `PO-${y}${m}${d}-${seq}`;
}
