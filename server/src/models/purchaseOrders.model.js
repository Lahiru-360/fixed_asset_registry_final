import { pool } from "../config/db.js";

export async function createPurchaseOrderModel({
  request_id,
  quotation_id,
  vendor_name,
  vendor_email,
  vendor_price,
  asset_name,
  quantity,
  po_number,
}) {
  const result = await pool.query(
    `INSERT INTO purchase_orders 
     (request_id, quotation_id, vendor_name, vendor_email, vendor_price, asset_name, quantity, po_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (request_id)
     DO NOTHING
     RETURNING *`,
    [
      request_id,
      quotation_id,
      vendor_name,
      vendor_email,
      vendor_price,
      asset_name,
      quantity,
      po_number,
    ]
  );

  return result.rows[0];
}

export async function getPurchaseOrderByRequestIdModel(request_id) {
  const result = await pool.query(
    `SELECT * FROM purchase_orders WHERE request_id = $1`,
    [request_id]
  );
  return result.rows[0];
}

export async function markPOSentModel(po_id) {
  const result = await pool.query(
    `UPDATE purchase_orders 
     SET sent = TRUE 
     WHERE po_id = $1 
     RETURNING *`,
    [po_id]
  );
  return result.rows[0];
}

export async function markPOReceivedModel(po_id) {
  const result = await pool.query(
    `UPDATE purchase_orders 
     SET received = TRUE 
     WHERE po_id = $1 
     RETURNING *`,
    [po_id]
  );
  return result.rows[0];
}

export async function savePOPdfPathModel(po_id, pdf_path) {
  const result = await pool.query(
    `UPDATE purchase_orders
     SET pdf_path = $1
     WHERE po_id = $2
     RETURNING *`,
    [pdf_path, po_id]
  );
  return result.rows[0];
}
