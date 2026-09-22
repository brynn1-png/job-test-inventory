import sql from "mssql";
import { env } from "../config/env.js";

const config: sql.config = {
  server: env.DB_SERVER,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  options: {
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000,
  },
};

let poolPromise: Promise<sql.ConnectionPool> | undefined;

export function getPool() {
  poolPromise ??= new sql.ConnectionPool(config).connect();
  return poolPromise;
}

export { sql };

