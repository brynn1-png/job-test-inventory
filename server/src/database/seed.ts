import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { getPool, sql } from "./pool.js";

async function seed() {
  const pool = await getPool();
  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);

  await pool.request()
    .input("fullName", sql.NVarChar(120), "System Administrator")
    .input("email", sql.NVarChar(255), env.SEED_ADMIN_EMAIL.toLowerCase())
    .input("passwordHash", sql.NVarChar(255), passwordHash)
    .query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email = @email)
        INSERT INTO dbo.users (full_name, email, password_hash, role)
        VALUES (@fullName, @email, @passwordHash, N'administrator');
    `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.categories)
    BEGIN
      INSERT INTO dbo.categories (name, description)
      VALUES
        (N'Office Supplies', N'Paper, writing materials, and everyday office consumables'),
        (N'Electronics', N'Computers, accessories, and electronic equipment'),
        (N'Equipment', N'Tools, machinery, and operational equipment'),
        (N'General Supplies', N'Uncategorized supplies used across the organization');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.products)
    BEGIN
      DECLARE @officeSupplies UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE name = N'Office Supplies');
      DECLARE @electronics UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE name = N'Electronics');
      INSERT INTO dbo.products (category_id, name, barcode, description, unit, quantity, minimum_stock)
      VALUES
        (@electronics, N'Wireless Keyboard', N'DEMO-ELEC-001', N'Development demonstration product', N'unit', 18, 5),
        (@officeSupplies, N'Copy Paper A4', N'DEMO-OFFICE-001', N'Development demonstration product', N'ream', 40, 10);
    END;
  `);

  console.log(`Seed complete. Administrator: ${env.SEED_ADMIN_EMAIL}`);
  await pool.close();
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
