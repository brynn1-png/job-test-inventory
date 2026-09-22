import { Router } from "express";
import { getPool } from "../database/pool.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", asyncHandler(async (_request, response) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      (SELECT COUNT(*) FROM dbo.products WHERE is_active = 1) AS totalProducts,
      (SELECT COALESCE(SUM(quantity), 0) FROM dbo.products WHERE is_active = 1) AS totalUnits,
      (SELECT COUNT(*) FROM dbo.products WHERE is_active = 1 AND quantity > 0 AND quantity <= minimum_stock) AS lowStock,
      (SELECT COUNT(*) FROM dbo.products WHERE is_active = 1 AND quantity = 0) AS outOfStock;

    SELECT TOP (8) t.id, t.transaction_type AS transactionType, t.quantity,
      t.created_at AS createdAt, p.name AS productName, u.full_name AS userName
    FROM dbo.stock_transactions t
    JOIN dbo.products p ON p.id = t.product_id
    JOIN dbo.users u ON u.id = t.user_id
    ORDER BY t.created_at DESC;
  `);
  const recordsets = result.recordsets as unknown as Array<Array<Record<string, unknown>>>;
  response.json({ summary: recordsets[0]?.[0], recentActivity: recordsets[1] ?? [] });
}));
