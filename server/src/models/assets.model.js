import { pool } from "../config/db.js";

export async function createAssetModel(data) {
  const {
    asset_number,
    po_id,
    asset_name,
    category_id,
    purchase_cost,
    useful_life,
    depreciation_rate,
    residual_value,
    department,
  } = data;

  const result = await pool.query(
    `
    INSERT INTO assets 
    (po_id, asset_name, category_id, purchase_cost, useful_life, depreciation_rate, residual_value, department, asset_number)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      po_id,
      asset_name,
      category_id,
      purchase_cost,
      useful_life,
      depreciation_rate,
      residual_value,
      department,
      asset_number,
    ]
  );

  return result.rows[0];
}

export async function getAssetsByPOModel(po_id) {
  const result = await pool.query(
    `SELECT * FROM assets WHERE po_id = $1 ORDER BY asset_id`,
    [po_id]
  );

  return result.rows;
}

export async function getAllAssetsModel() {
  const result = await pool.query(`
    SELECT 
      a.asset_id,
      a.asset_number,
      a.asset_name,
      a.purchase_cost,
      a.useful_life,
      a.depreciation_rate,
      a.residual_value,
      a.department,
      a.acquisition_date,
      ar.request_id,
      c.name AS category_name
    FROM assets a
    JOIN purchase_orders po ON a.po_id = po.po_id
    JOIN asset_requests ar ON po.request_id = ar.request_id
    LEFT JOIN asset_categories c ON a.category_id = c.category_id
    ORDER BY a.asset_id DESC
  `);

  return result.rows;
}

export async function getAssetsByAcquisitionPeriodModel(year, month) {
  const result = await pool.query(
    `
    SELECT 
      a.asset_id,
      a.asset_number,
      a.asset_name,
      a.purchase_cost,
      a.useful_life,
      a.depreciation_rate,
      a.residual_value,
      a.department,
      a.acquisition_date,
      ar.request_id,
      c.name AS category_name
    FROM assets a
    JOIN purchase_orders po ON a.po_id = po.po_id
    JOIN asset_requests ar ON po.request_id = ar.request_id
    LEFT JOIN asset_categories c ON a.category_id = c.category_id
    WHERE EXTRACT(YEAR FROM a.acquisition_date) * 100 + EXTRACT(MONTH FROM a.acquisition_date) 
          <= $1 * 100 + $2
    ORDER BY a.asset_id DESC
    `,
    [year, month]
  );

  return result.rows;
}

export async function getAssetsPaginatedModel({
  page = 1,
  limit = 10,
  search = "",
  category = "All",
  sort = "newest",
}) {
  const offset = (page - 1) * limit;

  const values = [];
  let where = [];
  let idx = 1;

  if (search) {
    where.push(`
      (
        a.asset_name ~* $${idx}
        OR a.asset_number ~* $${idx}
        OR c.name ~* $${idx}
      )
    `);
    values.push(`(^|\\s)${search.trim()}`);
    idx++;
  }

  if (category && category !== "All") {
    where.push(`c.name = $${idx}`);
    values.push(category);
    idx++;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const orderBy =
    sort === "oldest"
      ? "ORDER BY a.acquisition_date ASC"
      : "ORDER BY a.acquisition_date DESC";

  const dataQuery = `
    SELECT 
      a.asset_id,
      a.asset_number,
      a.asset_name,
      a.purchase_cost,
      a.useful_life,
      a.depreciation_rate,
      a.residual_value,
      a.department,
      a.acquisition_date,
      ar.request_id,
      c.name AS category_name
    FROM assets a
    JOIN purchase_orders po ON a.po_id = po.po_id
    JOIN asset_requests ar ON po.request_id = ar.request_id
    LEFT JOIN asset_categories c ON a.category_id = c.category_id
    ${whereClause}
    ${orderBy}
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM assets a
    JOIN purchase_orders po ON a.po_id = po.po_id
    JOIN asset_requests ar ON po.request_id = ar.request_id
    LEFT JOIN asset_categories c ON a.category_id = c.category_id
    ${whereClause}
  `;

  const dataRes = await pool.query(dataQuery, [...values, limit, offset]);
  const countRes = await pool.query(countQuery, values);

  return {
    assets: dataRes.rows,
    total: countRes.rows[0].total,
  };
}
