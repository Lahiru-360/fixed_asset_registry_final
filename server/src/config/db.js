import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

console.log("BOOT STEP 0: before DB");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
