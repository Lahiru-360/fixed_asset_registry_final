import { pool } from "../config/db.js";

// Get request summary
export async function getRequestSummaryModel(requestId) {
  const result = await pool.query(
    `SELECT ar.*, 
            e.first_name || ' ' || e.last_name AS employee_name,
            e.department
     FROM asset_requests ar
     JOIN employees e ON e.employee_id = ar.employee_id
     WHERE ar.request_id = $1`,
    [requestId]
  );
  return result.rows[0];
}

// Get all quotations for a request
export async function getQuotationsByRequestIdModel(requestId) {
  const result = await pool.query(
    `SELECT * FROM quotations 
     WHERE request_id = $1
     ORDER BY created_at DESC`,
    [requestId]
  );
  return result.rows;
}

// Create a quotation
export async function createQuotationModel(
  requestId,
  vendorName,
  vendorEmail,
  asset_name,
  price,
  fileUrl
) {
  const result = await pool.query(
    `INSERT INTO quotations (request_id, vendor_name, vendor_email, asset_name, price, file_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [requestId, vendorName, vendorEmail, asset_name, price, fileUrl]
  );
  return result.rows[0];
}

// Get single quotation
export async function getQuotationByIdModel(quotationId) {
  const result = await pool.query(
    `SELECT * FROM quotations WHERE quotation_id = $1`,
    [quotationId]
  );
  return result.rows[0];
}

// Select final quotation → update request status
export async function selectFinalQuotationModel(requestId, quotationId) {
  await pool.query(
    `UPDATE quotations SET is_final = FALSE WHERE request_id = $1`,
    [requestId]
  );

  const result = await pool.query(
    `UPDATE quotations 
     SET is_final = TRUE
     WHERE quotation_id = $1
     RETURNING *`,
    [quotationId]
  );

  await pool.query(
    `UPDATE asset_requests
     SET status = 'Quotation Selected'
     WHERE request_id = $1`,
    [requestId]
  );

  return result.rows[0];
}

export async function getFinalQuotationModel(requestId) {
  const result = await pool.query(
    `SELECT * FROM quotations 
     WHERE request_id = $1 AND is_final = TRUE
     LIMIT 1`,
    [requestId]
  );

  return result.rows[0];
}

export async function updateQuotationModel(
  quotationId,
  vendorName,
  vendorEmail,
  asset_name,
  price,
  fileUrl = null
) {
  if (fileUrl) {
    const result = await pool.query(
      `UPDATE quotations
       SET vendor_name = $1,
           vendor_email = $2,
           asset_name = $3,
           price = $4,
           file_url = $5
       WHERE quotation_id = $6
       RETURNING *`,
      [vendorName, vendorEmail, asset_name, price, fileUrl, quotationId]
    );

    return result.rows[0];
  } else {
    const result = await pool.query(
      `UPDATE quotations
       SET vendor_name = $1,
           vendor_email = $2,
           asset_name = $3,
           price = $4
       WHERE quotation_id = $5
       RETURNING *`,
      [vendorName, vendorEmail, asset_name, price, quotationId]
    );

    return result.rows[0];
  }
}

export async function deleteQuotationModel(quotationId) {
  const result = await pool.query(
    `DELETE FROM quotations WHERE quotation_id = $1 RETURNING file_url`,
    [quotationId]
  );

  return result.rows[0]; // contains file_url for deleting the actual file
}
