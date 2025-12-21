// src/models/AssetRequest.js
import { pool } from "../config/db.js";

export default class AssetRequest {
  static async create({ employee_id, asset_name, quantity, reason }) {
    const query = `
      INSERT INTO asset_requests (employee_id, asset_name, quantity, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      employee_id,
      asset_name,
      quantity,
      reason,
    ]);
    return result.rows[0];
  }

  static async findByEmployee(employee_id) {
    const query = `
      SELECT * FROM asset_requests
      WHERE employee_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [employee_id]);
    return result.rows;
  }

  // Stats for a single employee
  static async statsForEmployee(employee_id) {
    const totalQ = `SELECT COUNT(*)::int AS total FROM asset_requests WHERE employee_id = $1;`;
    const pendingQ = `SELECT COUNT(*)::int AS pending FROM asset_requests WHERE employee_id = $1 AND status = 'Pending';`;
    const approvedThisMonthQ = `
  SELECT COUNT(*)::int AS approved_this_month
  FROM asset_requests
  WHERE employee_id = $1
    AND status IN (
      'Approved',
      'Quotation Selected',
      'Purchase Order Sent',
      'Asset Received',
      'Completed'
    )
    AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);
`;

    const completedQ = `SELECT COUNT(*)::int AS completed FROM asset_requests WHERE employee_id = $1 AND status = 'Completed';`;
    const rejectedQ = `SELECT COUNT(*)::int AS rejected FROM asset_requests WHERE employee_id = $1 AND status = 'Rejected';`;

    const [
      totalRes,
      pendingRes,
      approvedThisMonthRes,
      completedRes,
      rejectedRes,
    ] = await Promise.all([
      pool.query(totalQ, [employee_id]),
      pool.query(pendingQ, [employee_id]),
      pool.query(approvedThisMonthQ, [employee_id]),
      pool.query(completedQ, [employee_id]),
      pool.query(rejectedQ, [employee_id]),
    ]);

    return {
      total: totalRes.rows[0].total,
      pending: pendingRes.rows[0].pending,
      approvedThisMonth: approvedThisMonthRes.rows[0].approved_this_month,
      completed: completedRes.rows[0].completed,
      rejected: rejectedRes.rows[0].rejected,
    };
  }

  // Global stats (for admin)
  static async statsGlobal() {
    const totalQ = `SELECT COUNT(*)::int AS total FROM asset_requests;`;
    const pendingQ = `SELECT COUNT(*)::int AS pending FROM asset_requests WHERE status = 'Pending';`;
    const approvedThisMonthQ = `
  SELECT COUNT(*)::int AS approved_this_month
  FROM asset_requests
  WHERE employee_id = $1
    AND status IN (
      'Approved',
      'Quotation Selected',
      'Purchase Order Sent',
      'Asset Received',
      'Completed'
    )
    AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);
`;

    const completedQ = `SELECT COUNT(*)::int AS completed FROM asset_requests WHERE status = 'Completed';`;
    const rejectedQ = `SELECT COUNT(*)::int AS rejected FROM asset_requests WHERE status = 'Rejected';`;

    const [
      totalRes,
      pendingRes,
      approvedThisMonthRes,
      completedRes,
      rejectedRes,
    ] = await Promise.all([
      pool.query(totalQ),
      pool.query(pendingQ),
      pool.query(approvedThisMonthQ),
      pool.query(completedQ),
      pool.query(rejectedQ),
    ]);

    return {
      total: totalRes.rows[0].total,
      pending: pendingRes.rows[0].pending,
      approvedThisMonth: approvedThisMonthRes.rows[0].approved_this_month,
      completed: completedRes.rows[0].completed,
      rejected: rejectedRes.rows[0].rejected,
    };
  }
}
