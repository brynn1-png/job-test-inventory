# Inventory Management System Page Guide

This guide documents every application page, its purpose, available actions, permissions, API dependencies, and expected states.

## Roles and permissions

| Capability | Administrator | Manager | Staff |
|---|---:|---:|---:|
| View dashboard, products, categories, transactions, and reports | Yes | Yes | Yes |
| Record stock in and stock out | Yes | Yes | Yes |
| Create and edit products | Yes | Yes | No |
| Archive products | Yes | No | No |
| Create and edit categories | Yes | Yes | No |
| Delete unused categories | Yes | No | No |
| Export the inventory report | Yes | Yes | Yes |

Permissions are enforced by the API as well as hidden or disabled in the interface where appropriate.

## Global navigation and session behavior

Authenticated pages share the application shell:

- Desktop navigation appears in a collapsible left sidebar.
- Mobile navigation appears in a drawer opened from the top bar.
- The account menu displays the signed-in user's initials, name, and role.
- **Sign out** removes the locally stored access token and returns the user to the login page.
- Unknown client routes redirect to the dashboard; unauthenticated access redirects to `/login`.

The client stores the JWT access token in browser local storage under `inventory-access-token`. The default token lifetime is eight hours.

## Login

- **Route:** `/login`
- **Access:** Public
- **API:** `POST /api/auth/login`

### Purpose

Authenticates an active user with an email address and password.

### Controls and behavior

- Email address is required and must be a valid email format.
- Password is required and must contain at least eight characters.
- The submit button displays a loading state during authentication.
- Invalid credentials display the API error above the form.
- A successful login stores the access token and returns the user to the originally requested page or the dashboard.
- An already authenticated user who visits `/login` is redirected to the dashboard.

### Development account

After running `npm run seed` with the default environment values:

```text
Email: admin@inventory.local
Password: Admin123!
```

Change these values before seeding any shared environment.

## Dashboard

- **Route:** `/`
- **Access:** All authenticated roles
- **API:** `GET /api/dashboard`

### Purpose

Provides an overview of current inventory and recent stock activity.

### Content and actions

- Active product count
- Total units on hand
- Low-stock product count
- Out-of-stock product count
- Eight most recent stock transactions
- **Record movement** opens the Stock Movement page.
- **View full history** opens the Transaction History page.

### States

- Skeleton panels appear while the dashboard request is loading.
- An error alert appears when the dashboard cannot be loaded.
- The recent-activity table shows the movement type, product, quantity, user, and date.

## Products

- **Route:** `/products`
- **Access:** All authenticated roles
- **APIs:** `GET /api/products`, `GET /api/categories`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`

### Purpose

Maintains the active product catalog and current stock status.

### Content and filters

- Search by product name or barcode.
- Filter by category.
- Sort by product name or quantity.
- Review barcode, category, quantity, unit, and stock status.
- Paginate the product table.

### Management actions

- Administrators and managers can create and edit products.
- Administrators can archive active products.
- Staff have read-only access.

The product form accepts a name, barcode, optional category, unit, low-stock level, and optional description. New products begin with a quantity of zero; inventory quantities change only through stock movements.

Archiving removes a product from active lists and stock movement forms without deleting its transaction history.

## Categories

- **Route:** `/categories`
- **Access:** All authenticated roles
- **APIs:** `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id`

### Purpose

Maintains the reusable categories assigned to products.

### Content and actions

- View category name, description, and active product count.
- Administrators and managers can add and edit categories.
- Administrators can delete categories.
- Staff have read-only access.

A category cannot be deleted while products still reference it. Products must first be moved to another category or have their category assignment removed.

## Stock Movement

- **Route:** `/stock`
- **Access:** All authenticated roles
- **APIs:** `GET /api/products`, `POST /api/inventory/stock-in`, `POST /api/inventory/stock-out`

### Purpose

Records inventory receipts and releases while preserving a permanent audit trail.

### Workflow

1. Select **Stock in** or **Stock out**.
2. Search for and select an active product.
3. Review its current quantity and stock status.
4. Enter a positive whole-number quantity.
5. Optionally enter a note or reference.
6. Confirm the movement.

The server performs the quantity update and transaction-log insertion in one serializable database transaction. Stock out is rejected when the requested quantity exceeds available inventory. A successful movement updates the displayed balance and clears the quantity and notes fields.

## Transaction History

- **Route:** `/transactions`
- **Access:** All authenticated roles
- **API:** `GET /api/inventory/transactions?limit=500`

### Purpose

Provides a chronological audit trail of stock movements.

### Content and filters

- Search by product name, barcode, or the recording user's name.
- Filter by stock-in or stock-out movement.
- Sort by transaction date.
- Review movement quantity, resulting balance, user, notes, and timestamp.
- Paginate the transaction table.

Transaction records are permanent and are not removed when a product is archived.

## Reports

- **Route:** `/reports`
- **Access:** All authenticated roles
- **API:** `GET /api/reports/inventory`

### Purpose

Provides a current inventory snapshot with aggregate totals and product-level availability.

### Content and actions

- Product, unit, low-stock, and out-of-stock totals
- Product name, barcode, category, quantity, minimum-stock level, and status
- Paginated report table
- **Export CSV** downloads `inventory-report-YYYY-MM-DD.csv`

The export button remains disabled until report data has loaded.

## Unknown routes

Any unrecognized client-side route redirects to `/`. The route guard then sends unauthenticated users to `/login`.

Unknown API endpoints return HTTP `404` with:

```json
{ "message": "The requested API endpoint was not found." }
```

## Main workflow

A typical administrator setup and inventory workflow is:

1. Sign in.
2. Create categories.
3. Register products.
4. Use Stock Movement to receive initial quantities.
5. Record later stock receipts and releases.
6. Review the Dashboard and Transaction History.
7. Export a current inventory report.
