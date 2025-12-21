import { pool } from "../config/db.js";

// Get all categories (system + custom)
export async function getAllCategoriesModel() {
  const result = await pool.query(
    `SELECT * FROM asset_categories ORDER BY category_id ASC`
  );
  return result.rows;
}

export async function getCategoryByIdModel(category_id) {
  const result = await pool.query(
    `SELECT * FROM asset_categories WHERE category_id = $1`,
    [category_id]
  );
  return result.rows[0];
}

// Create custom category
export async function createCategoryModel({
  name,
  useful_life,
  depreciation_rate,
  residual_value,
}) {
  const result = await pool.query(
    `INSERT INTO asset_categories (name, useful_life, depreciation_rate, residual_value)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, useful_life, depreciation_rate, residual_value]
  );

  return result.rows[0];
}

// Update custom category
export async function updateCategoryModel(
  id,
  { useful_life, depreciation_rate, residual_value }
) {
  const result = await pool.query(
    `UPDATE asset_categories
     SET useful_life = $1,
         depreciation_rate = $2,
         residual_value = $3
     WHERE category_id = $4
     AND name NOT IN ('Land','Buildings','Machinery & Equipment','Vehicles','Furniture & Fixtures','Computer Equipment & IT','Office Equipment')
     RETURNING *`,
    [useful_life, depreciation_rate, residual_value, id]
  );

  return result.rows[0];
}

// Delete custom category
export async function deleteCategoryModel(id) {
  const result = await pool.query(
    `DELETE FROM asset_categories
     WHERE category_id = $1
     AND name NOT IN ('Land','Buildings','Machinery & Equipment','Vehicles','Furniture & Fixtures','Computer Equipment & IT','Office Equipment')
     RETURNING *`,
    [id]
  );
  return result.rows[0];
}
