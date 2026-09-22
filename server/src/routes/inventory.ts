import { Router } from "express";
import { getPool, sql } from "../database/pool.js";
import { asyncHandler } from "../lib/async-handler.js";
import { requireAuth } from "../middleware/auth.js";
import { stockMovementSchema, transactionQuerySchema } from "../schemas/inventory.js";
import { applyStockMovement } from "../services/stock.js";

export const inventoryRouter = Router();
inventoryRouter.use(requireAuth);

async function movementHandler(request: Parameters<Parameters<typeof asyncHandler>[0]>[0], response: Parameters<Parameters<typeof asyncHandler>[0]>[1], type: "STOCK_IN" | "STOCK_OUT") {
  const input = stockMovementSchema.parse(request.body);
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const movement = await applyStockMovement(transaction, { ...input, userId: request.user!.id, type });
    await transaction.commit();
    response.status(201).json({ movement });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

inventoryRouter.post("/stock-in", asyncHandler((request, response) => movementHandler(request, response, "STOCK_IN")));
inventoryRouter.post("/stock-out", asyncHandler((request, response) => movementHandler(request, response, "STOCK_OUT")));

inventoryRouter.get("/transactions", asyncHandler(async (request, response) => {
  const query = transactionQuerySchema.parse(request.query);
  const pool = await getPool();
  const result = await pool.request()
    .input("search", sql.NVarChar(100), `%${query.search}%`)
    .input("type", sql.NVarChar(10), query.type ?? null)
    .input("limit", sql.Int, query.limit)
    .query(`
      SELECT TOP (@limit) t.id, t.transaction_type AS transactionType, t.quantity,
        t.previous_quantity AS previousQuantity, t.new_quantity AS newQuantity,
        t.notes, t.created_at AS createdAt,
        p.id AS productId, p.name AS productName, p.barcode,
        u.id AS userId, u.full_name AS userName
      FROM dbo.stock_transactions t
      JOIN dbo.products p ON p.id = t.product_id
      JOIN dbo.users u ON u.id = t.user_id
      WHERE (@type IS NULL OR t.transaction_type = @type)
        AND (@search = N'%%' OR p.name LIKE @search OR p.barcode LIKE @search OR u.full_name LIKE @search)
      ORDER BY t.created_at DESC;
    `);
  response.json({ transactions: result.recordset });
}));

