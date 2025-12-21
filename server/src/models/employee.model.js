import { pool } from "../config/db.js";

export const EmployeeModel = {
  create: async ({
    firebaseUID,
    firstName,
    lastName,
    phone,
    email,
    department,
  }) => {
    const query = `
      INSERT INTO employees (firebase_uid, first_name, last_name, phone, email, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING employee_id, first_name, last_name, email, department, role;
    `;

    const result = await pool.query(query, [
      firebaseUID,
      firstName,
      lastName,
      phone,
      email,
      department,
    ]);

    return result.rows[0];
  },

  findByFirebaseUID: async (firebaseUID) => {
    const query = `
      SELECT employee_id, first_name, last_name, email, department, role 
      FROM employees
      WHERE firebase_uid = $1;
    `;

    const result = await pool.query(query, [firebaseUID]);

    return result.rows[0]; // return null if not found
  },
};
