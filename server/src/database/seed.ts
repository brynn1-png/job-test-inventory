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
        (N'Beverages', N'Drinks, juices, water, and powdered beverages'),
        (N'Canned Goods', N'Canned meat, fish, vegetables, and ready-to-eat goods'),
        (N'Snacks', N'Biscuits, chips, sweets, and quick snacks'),
        (N'Household', N'Cleaning and everyday household supplies');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.products)
    BEGIN
      DECLARE @beverages UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE name = N'Beverages');
      DECLARE @snacks UNIQUEIDENTIFIER = (SELECT id FROM dbo.categories WHERE name = N'Snacks');
      INSERT INTO dbo.products (category_id, name, barcode, description, unit, quantity, minimum_stock)
      VALUES
        (@beverages, N'Bottled Water 500ml', N'4800000000017', N'Development demonstration product', N'bottle', 48, 12),
        (@snacks, N'Classic Crackers 100g', N'4800000000024', N'Development demonstration product', N'pack', 20, 8);
    END;
  `);

  console.log(`Seed complete. Administrator: ${env.SEED_ADMIN_EMAIL}`);
  await pool.close();
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});

