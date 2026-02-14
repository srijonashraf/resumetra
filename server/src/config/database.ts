import { Pool, PoolConfig } from "pg";
import * as dotenv from "dotenv";
import { requireEnv } from "../utils";

dotenv.config();

// Environment configuration
const DATABASE_URL = requireEnv("DATABASE_URL");
const DB_SSL = requireEnv("DB_SSL") === "true";
const DB_SSL_REJECT_UNAUTHORIZED =
  requireEnv("DB_SSL_REJECT_UNAUTHORIZED") === "true";

// Base pool configuration: always read from DATABASE_URL
const config: PoolConfig = {
  connectionString: DATABASE_URL,
};

/**
 * Optional SSL settings for cloud-hosted Postgres.
 *
 * - DB_SSL=false (default): let driver / provider decide SSL behaviour
 * - DB_SSL=true: enable SSL
 *   - DB_SSL_REJECT_UNAUTHORIZED=false (default): accept provided certs
 *   - DB_SSL_REJECT_UNAUTHORIZED=true: require trusted CA
 */
if (DB_SSL) {
  config.ssl = {
    rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED,
  };
}

// Shared connection pool used across the backend
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

export default pool;
