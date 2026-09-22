IF DB_ID(N'SouthEmeraldInventory') IS NULL
BEGIN
  CREATE DATABASE SouthEmeraldInventory;
END;
GO

USE SouthEmeraldInventory;
GO

IF OBJECT_ID(N'dbo.stock_transactions', N'U') IS NOT NULL DROP TABLE dbo.stock_transactions;
IF OBJECT_ID(N'dbo.products', N'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID(N'dbo.categories', N'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_users PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  full_name NVARCHAR(120) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  role NVARCHAR(30) NOT NULL CONSTRAINT DF_users_role DEFAULT N'staff',
  is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT 1,
  created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_users_email UNIQUE (email),
  CONSTRAINT CK_users_role CHECK (role IN (N'administrator', N'manager', N'staff'))
);
GO

CREATE TABLE dbo.categories (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_categories PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(500) NULL,
  created_at DATETIME2(0) NOT NULL CONSTRAINT DF_categories_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_categories_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_categories_name UNIQUE (name)
);
GO

CREATE TABLE dbo.products (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_products PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  category_id UNIQUEIDENTIFIER NULL,
  name NVARCHAR(160) NOT NULL,
  barcode NVARCHAR(80) NOT NULL,
  description NVARCHAR(1000) NULL,
  unit NVARCHAR(30) NOT NULL CONSTRAINT DF_products_unit DEFAULT N'piece',
  quantity INT NOT NULL CONSTRAINT DF_products_quantity DEFAULT 0,
  minimum_stock INT NOT NULL CONSTRAINT DF_products_minimum_stock DEFAULT 5,
  is_active BIT NOT NULL CONSTRAINT DF_products_is_active DEFAULT 1,
  created_at DATETIME2(0) NOT NULL CONSTRAINT DF_products_created_at DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_products_updated_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_products_categories FOREIGN KEY (category_id) REFERENCES dbo.categories(id),
  CONSTRAINT UQ_products_barcode UNIQUE (barcode),
  CONSTRAINT CK_products_quantity CHECK (quantity >= 0),
  CONSTRAINT CK_products_minimum_stock CHECK (minimum_stock >= 0)
);
GO

CREATE TABLE dbo.stock_transactions (
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_stock_transactions PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  product_id UNIQUEIDENTIFIER NOT NULL,
  user_id UNIQUEIDENTIFIER NOT NULL,
  transaction_type NVARCHAR(10) NOT NULL,
  quantity INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  notes NVARCHAR(500) NULL,
  created_at DATETIME2(0) NOT NULL CONSTRAINT DF_stock_transactions_created_at DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_stock_transactions_products FOREIGN KEY (product_id) REFERENCES dbo.products(id),
  CONSTRAINT FK_stock_transactions_users FOREIGN KEY (user_id) REFERENCES dbo.users(id),
  CONSTRAINT CK_stock_transactions_type CHECK (transaction_type IN (N'STOCK_IN', N'STOCK_OUT')),
  CONSTRAINT CK_stock_transactions_quantity CHECK (quantity > 0),
  CONSTRAINT CK_stock_transactions_balances CHECK (previous_quantity >= 0 AND new_quantity >= 0)
);
GO

CREATE INDEX IX_products_name ON dbo.products(name);
CREATE INDEX IX_products_category_id ON dbo.products(category_id);
CREATE INDEX IX_stock_transactions_product_created ON dbo.stock_transactions(product_id, created_at DESC);
CREATE INDEX IX_stock_transactions_created ON dbo.stock_transactions(created_at DESC);
GO

