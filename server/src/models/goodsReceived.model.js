import { pool } from "../config/db.js";

export async function createGRNModel(po_id, grn_number, pdf_path) {
  const result = await pool.query(
    `INSERT INTO goods_received_notes (po_id, grn_number, pdf_path)
     VALUES ($1, $2, $3) RETURNING *`,
    [po_id, grn_number, pdf_path]
  );
  return result.rows[0];
}

export async function getGRNByPOModel(po_id) {
  const result = await pool.query(
    `SELECT * FROM goods_received_notes WHERE po_id = $1`,
    [po_id]
  );
  return result.rows[0];
}

export async function getGRNByRequestIdModel(requestId) {
  const result = await pool.query(
    `
    SELECT grn.*
    FROM goods_received_notes grn
    JOIN purchase_orders po ON po.po_id = grn.po_id
    WHERE po.request_id = $1
    `,
    [requestId]
  );

  return result.rows[0];
}
