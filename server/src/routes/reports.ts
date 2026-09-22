import { Router } from "express";
import { getPool } from "../database/pool.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

reportsRouter.get("/inventory", asyncHandler(async (_request, response) => {
  const pool = await getPool();
  const [summary, products] = await Promise.all([
    pool.request().query(`
      SELECT COUNT(*) AS totalProducts,
        COALESCE(SUM(quantity), 0) AS totalUnits,
        SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) AS outOfStock,
        SUM(CASE WHEN quantity > 0 AND quantity <= minimum_stock THEN 1 ELSE 0 END) AS lowStock
      FROM dbo.products WHERE is_active = 1;
    `),
    pool.request().query(`
      SELECT p.id, p.name, p.barcode, c.name AS categoryName, p.unit, p.quantity,
        p.minimum_stock AS minimumStock,
        CASE WHEN p.quantity = 0 THEN N'OUT_OF_STOCK'
             WHEN p.quantity <= p.minimum_stock THEN N'LOW_STOCK'
             ELSE N'IN_STOCK' END AS stockStatus
      FROM dbo.products p
      LEFT JOIN dbo.categories c ON c.id = p.category_id
      WHERE p.is_active = 1
      ORDER BY p.name;
    `),
  ]);
  response.json({ summary: summary.recordset[0], products: products.recordset });
}));

