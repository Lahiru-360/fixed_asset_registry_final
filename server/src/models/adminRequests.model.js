import { pool } from "../config/db.js";

export const getAllRequests = async () => {
  const query = `
    SELECT 
      ar.*, 
      CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
      e.email, e.department
    FROM asset_requests ar
    JOIN employees e ON ar.employee_id = e.employee_id
    ORDER BY ar.created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getRequestsPaginated = async ({
  limit,
  offset,
  search,
  status,
  sortOrder,
}) => {
  const where = [];
  const values = [];
  let idx = 1;

  if (search) {
    where.push(`
    (
      ar.asset_name ~* $${idx}
      OR (e.first_name || ' ' || e.last_name) ~* $${idx}
      OR e.email ~* $${idx}
      OR e.department ~* $${idx}
    )
  `);
    values.push(`(^|\\s)${search}`);
    idx++;
  }

  if (status && status !== "All") {
    where.push(`ar.status = $${idx}`);
    values.push(status);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const orderBy =
    sortOrder === "oldest"
      ? "ORDER BY ar.created_at ASC"
      : "ORDER BY ar.created_at DESC";

  const dataQuery = `
    SELECT 
      ar.*,
      CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
      e.email,
      e.department
    FROM asset_requests ar
    JOIN employees e ON ar.employee_id = e.employee_id
    ${whereClause}
    ${orderBy}
    LIMIT $${idx} OFFSET $${idx + 1};
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM asset_requests ar
    JOIN employees e ON ar.employee_id = e.employee_id
    ${whereClause};
  `;

  const dataValues = [...values, limit, offset];

  const [dataRes, countRes] = await Promise.all([
    pool.query(dataQuery, dataValues),
    pool.query(countQuery, values),
  ]);

  return {
    rows: dataRes.rows,
    total: Number(countRes.rows[0].count),
  };
};

export const getRequestById = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM asset_requests WHERE request_id = $1",
    [id]
  );
  return rows[0];
};

export const updateRequestStatus = async (id, status, adminId) => {
  const query = `
    UPDATE asset_requests
    SET status = $1,
        reviewed_by = $2,
        reviewed_at = NOW()
    WHERE request_id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [status, adminId, id]);
  return rows[0];
};
