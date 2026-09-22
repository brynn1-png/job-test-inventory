export type UserRole = "administrator" | "manager" | "staff";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type Product = {
  id: string;
  name: string;
  barcode: string;
  description: string | null;
  unit: string;
  quantity: number;
  minimumStock: number;
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
};

export type StockTransaction = {
  id: string;
  transactionType: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  notes: string | null;
  createdAt: string;
  productId: string;
  productName: string;
  barcode: string;
  userId: string;
  userName: string;
};

export type InventorySummary = {
  totalProducts: number;
  totalUnits: number;
  lowStock: number;
  outOfStock: number;
};

