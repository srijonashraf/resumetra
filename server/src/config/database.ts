import { Pool, PoolConfig } from "pg";
import * as dotenv from "dotenv";
import { requireEnv } from "../utils";

dotenv.config();

const DATABASE_URL = requireEnv("DATABASE_URL");

const config: PoolConfig = {
  connectionString: DATABASE_URL,
};

// Create a connection pool to manage multiple database connections efficiently.
const pool = new Pool(config);

pool.on("error", (err: Error) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * One-shot connectivity check used during server startup.
 */
export const testConnection = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Connected to PostgreSQL database");
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database", error);
    process.exit(-1);
  }
};

export const closeConnection = async (): Promise<void> => {
  await pool.end();
  process.exit(0);
};

export default pool;
