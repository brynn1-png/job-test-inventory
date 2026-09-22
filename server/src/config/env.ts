import "dotenv/config";
import { z } from "zod";

const booleanValue = z.string().default("false").transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  DB_SERVER: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(1433),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_ENCRYPT: booleanValue,
  DB_TRUST_SERVER_CERTIFICATE: booleanValue,
  SEED_ADMIN_EMAIL: z.string().email().default("admin@southemerald.local"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin123!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Environment configuration is invalid. Copy .env.example to .env and review every value.");
}

export const env = parsed.data;

