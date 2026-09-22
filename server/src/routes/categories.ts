import { Router } from "express";
import { getPool, sql } from "../database/pool.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { categorySchema } from "../schemas/category.js";
import { idParamsSchema } from "../schemas/common.js";

export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);

categoriesRouter.get("/", asyncHandler(async (_request, response) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT c.id, c.name, c.description, c.created_at AS createdAt, c.updated_at AS updatedAt,
      COUNT(p.id) AS productCount
    FROM dbo.categories c
    LEFT JOIN dbo.products p ON p.category_id = c.id AND p.is_active = 1
    GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
    ORDER BY c.name;
  `);
  response.json({ categories: result.recordset });
}));

categoriesRouter.post("/", requireRole("administrator", "manager"), asyncHandler(async (request, response) => {
  const input = categorySchema.parse(request.body);
  const pool = await getPool();
  const result = await pool.request()
    .input("name", sql.NVarChar(100), input.name)
    .input("description", sql.NVarChar(500), input.description)
    .query(`
      INSERT INTO dbo.categories (name, description)
      OUTPUT inserted.id, inserted.name, inserted.description, inserted.created_at AS createdAt, inserted.updated_at AS updatedAt
      VALUES (@name, @description);
    `);
  response.status(201).json({ category: result.recordset[0] });
}));

categoriesRouter.put("/:id", requireRole("administrator", "manager"), asyncHandler(async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = categorySchema.parse(request.body);
  const pool = await getPool();
  const result = await pool.request()
    .input("id", sql.UniqueIdentifier, id)
    .input("name", sql.NVarChar(100), input.name)
    .input("description", sql.NVarChar(500), input.description)
    .query(`
      UPDATE dbo.categories SET name = @name, description = @description, updated_at = SYSUTCDATETIME()
      OUTPUT inserted.id, inserted.name, inserted.description, inserted.created_at AS createdAt, inserted.updated_at AS updatedAt
      WHERE id = @id;
    `);
  if (!result.recordset[0]) throw new HttpError(404, "Category not found.");
  response.json({ category: result.recordset[0] });
}));

categoriesRouter.delete("/:id", requireRole("administrator"), asyncHandler(async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const pool = await getPool();
  const products = await pool.request().input("id", sql.UniqueIdentifier, id)
    .query("SELECT COUNT(*) AS count FROM dbo.products WHERE category_id = @id;");
  if (products.recordset[0].count > 0) throw new HttpError(409, "Move or archive this category's products before deleting it.");
  const result = await pool.request().input("id", sql.UniqueIdentifier, id)
    .query("DELETE FROM dbo.categories OUTPUT deleted.id WHERE id = @id;");
  if (!result.recordset[0]) throw new HttpError(404, "Category not found.");
  response.status(204).send();
}));

