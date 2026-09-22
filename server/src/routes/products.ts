import { Router } from "express";
import { getPool, sql } from "../database/pool.js";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { idParamsSchema } from "../schemas/common.js";
import { productQuerySchema, productSchema } from "../schemas/product.js";

export const productsRouter = Router();
productsRouter.use(requireAuth);

const productSelect = `
  SELECT p.id, p.name, p.barcode, p.description, p.unit, p.quantity,
    p.minimum_stock AS minimumStock, p.is_active AS isActive,
    p.category_id AS categoryId, c.name AS categoryName,
    p.created_at AS createdAt, p.updated_at AS updatedAt,
    CASE WHEN p.quantity = 0 THEN N'OUT_OF_STOCK'
         WHEN p.quantity <= p.minimum_stock THEN N'LOW_STOCK'
         ELSE N'IN_STOCK' END AS stockStatus
  FROM dbo.products p
  LEFT JOIN dbo.categories c ON c.id = p.category_id
`;

productsRouter.get("/", asyncHandler(async (request, response) => {
  const query = productQuerySchema.parse(request.query);
  const pool = await getPool();
  const dbRequest = pool.request()
    .input("search", sql.NVarChar(100), `%${query.search}%`)
    .input("categoryId", sql.UniqueIdentifier, query.categoryId ?? null)
    .input("status", sql.NVarChar(10), query.status);
  const result = await dbRequest.query(`${productSelect}
    WHERE (@status = N'all' OR (@status = N'active' AND p.is_active = 1) OR (@status = N'archived' AND p.is_active = 0))
      AND (@categoryId IS NULL OR p.category_id = @categoryId)
      AND (@search = N'%%' OR p.name LIKE @search OR p.barcode LIKE @search)
    ORDER BY p.name;
  `);
  response.json({ products: result.recordset });
}));

productsRouter.get("/:id", asyncHandler(async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const pool = await getPool();
  const result = await pool.request().input("id", sql.UniqueIdentifier, id)
    .query(`${productSelect} WHERE p.id = @id;`);
  if (!result.recordset[0]) throw new HttpError(404, "Product not found.");
  response.json({ product: result.recordset[0] });
}));

productsRouter.post("/", requireRole("administrator", "manager"), asyncHandler(async (request, response) => {
  const input = productSchema.parse(request.body);
  const pool = await getPool();
  const result = await pool.request()
    .input("categoryId", sql.UniqueIdentifier, input.categoryId ?? null)
    .input("name", sql.NVarChar(160), input.name)
    .input("barcode", sql.NVarChar(80), input.barcode)
    .input("description", sql.NVarChar(1000), input.description)
    .input("unit", sql.NVarChar(30), input.unit)
    .input("minimumStock", sql.Int, input.minimumStock)
    .query(`
      INSERT INTO dbo.products (category_id, name, barcode, description, unit, minimum_stock)
      OUTPUT inserted.id
      VALUES (@categoryId, @name, @barcode, @description, @unit, @minimumStock);
    `);
  response.status(201).json({ id: result.recordset[0].id });
}));

productsRouter.put("/:id", requireRole("administrator", "manager"), asyncHandler(async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const input = productSchema.parse(request.body);
  const pool = await getPool();
  const result = await pool.request()
    .input("id", sql.UniqueIdentifier, id)
    .input("categoryId", sql.UniqueIdentifier, input.categoryId ?? null)
    .input("name", sql.NVarChar(160), input.name)
    .input("barcode", sql.NVarChar(80), input.barcode)
    .input("description", sql.NVarChar(1000), input.description)
    .input("unit", sql.NVarChar(30), input.unit)
    .input("minimumStock", sql.Int, input.minimumStock)
    .query(`
      UPDATE dbo.products SET category_id = @categoryId, name = @name, barcode = @barcode,
        description = @description, unit = @unit, minimum_stock = @minimumStock, updated_at = SYSUTCDATETIME()
      OUTPUT inserted.id
      WHERE id = @id;
    `);
  if (!result.recordset[0]) throw new HttpError(404, "Product not found.");
  response.json({ id: result.recordset[0].id });
}));

productsRouter.delete("/:id", requireRole("administrator"), asyncHandler(async (request, response) => {
  const { id } = idParamsSchema.parse(request.params);
  const pool = await getPool();
  const result = await pool.request().input("id", sql.UniqueIdentifier, id).query(`
    UPDATE dbo.products SET is_active = 0, updated_at = SYSUTCDATETIME()
    OUTPUT inserted.id WHERE id = @id AND is_active = 1;
  `);
  if (!result.recordset[0]) throw new HttpError(404, "Active product not found.");
  response.status(204).send();
}));

