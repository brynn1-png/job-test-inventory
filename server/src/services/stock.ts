import type { Transaction } from "mssql";
import { sql } from "../database/pool.js";
import { HttpError } from "../lib/http-error.js";

export type StockMovement = {
  productId: string;
  quantity: number;
  notes: string | null;
  userId: string;
  type: "STOCK_IN" | "STOCK_OUT";
};

type QuantityRow = { name: string; quantity: number; is_active: boolean };

export function calculateNewQuantity(current: number, quantity: number, type: StockMovement["type"]) {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new HttpError(400, "Quantity must be a positive whole number.");
  const next = type === "STOCK_IN" ? current + quantity : current - quantity;
  if (next < 0) throw new HttpError(409, "Stock-out quantity exceeds the available inventory.");
  return next;
}

export async function applyStockMovement(transaction: Transaction, input: StockMovement) {
  const lookup = await transaction.request()
    .input("productId", sql.UniqueIdentifier, input.productId)
    .query<QuantityRow>(`
      SELECT name, quantity, is_active
      FROM dbo.products WITH (UPDLOCK, ROWLOCK)
      WHERE id = @productId;
    `);
  const product = lookup.recordset[0];
  if (!product || !product.is_active) throw new HttpError(404, "Active product not found.");

  const nextQuantity = calculateNewQuantity(product.quantity, input.quantity, input.type);
  await transaction.request()
    .input("productId", sql.UniqueIdentifier, input.productId)
    .input("userId", sql.UniqueIdentifier, input.userId)
    .input("type", sql.NVarChar(10), input.type)
    .input("quantity", sql.Int, input.quantity)
    .input("previousQuantity", sql.Int, product.quantity)
    .input("newQuantity", sql.Int, nextQuantity)
    .input("notes", sql.NVarChar(500), input.notes)
    .query(`
      UPDATE dbo.products SET quantity = @newQuantity, updated_at = SYSUTCDATETIME() WHERE id = @productId;
      INSERT INTO dbo.stock_transactions
        (product_id, user_id, transaction_type, quantity, previous_quantity, new_quantity, notes)
      VALUES
        (@productId, @userId, @type, @quantity, @previousQuantity, @newQuantity, @notes);
    `);

  return { productId: input.productId, productName: product.name, previousQuantity: product.quantity, newQuantity: nextQuantity };
}

