# Inventory Management System

An interview-ready inventory management system for tracking products and stock across an organization. The project demonstrates a React and Ant Design client, an Express REST API, and a Microsoft SQL Server database with secure authentication, CRUD workflows, transactional stock updates, history, and reporting.

## Technology stack

- React 19, TypeScript, Vite, and Ant Design
- Express 5 and TypeScript
- Microsoft SQL Server 2022
- JSON Web Token authentication and bcrypt password hashing
- Zod request validation
- Vitest unit tests

## Features

- Email and password login
- Role-based permissions for administrators, managers, and staff
- Product and category CRUD
- Searchable, filterable inventory tables
- Atomic stock-in and stock-out transactions
- Negative-stock prevention
- Permanent stock movement history
- Inventory summary and CSV report export
- Responsive desktop and mobile layouts
- Accessible labels, visible focus states, and reduced-motion support

## Project structure

```text
job-test-inventory/
├── client/       React and Ant Design application
├── server/       Express REST API
├── database/     MSSQL schema
├── .env.example
└── package.json  Workspace commands
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Microsoft SQL Server 2022 Developer or Express Edition
- SQL Server Management Studio (SSMS), recommended for running the schema

The project uses SQL Server authentication. Enable mixed-mode authentication during SQL Server setup and create an account that can access the application database.

## Setup

For complete Windows and local SQL Server instructions, see [docs/SETUP.md](docs/SETUP.md).

### 1. Install dependencies

From the repository root:

```powershell
npm install
```

### 2. Configure the environment

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the SQL Server password and JWT secret. The JWT secret must contain at least 32 characters.

### 3. Create the database

Open `database/001_schema.sql` in SSMS, connect to the intended SQL Server instance, and execute the complete script. It creates `InventoryManagement`, its tables, constraints, and indexes. The script does not delete existing tables or data when rerun.

### 4. Seed the demonstration account

```powershell
npm run seed
```

Default development credentials come from `.env`:

```text
Email: admin@inventory.local
Password: Admin123!
```

Change these values before seeding any shared environment.

### 5. Start the application

```powershell
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:4000
- Health check: http://localhost:4000/api/health

The Vite development server proxies `/api` requests to Express.

## Useful commands

```powershell
npm run dev          # Start client and API
npm run dev:client   # Start only the React client
npm run dev:server   # Start only the Express API
npm run build        # Build client and server
npm run lint         # Lint client and server
npm test             # Run unit tests
npm run seed         # Seed development records
```

## Documentation

- [Local setup guide](docs/SETUP.md)
- [Page and workflow guide](docs/PAGE_GUIDE.md)
- [Verification and technical audit](docs/TEST_REPORT.md)

## REST API

All protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/me` | Return the current user |
| `GET` | `/api/dashboard` | Return inventory totals and recent activity |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create a category |
| `PUT` | `/api/categories/:id` | Update a category |
| `DELETE` | `/api/categories/:id` | Delete an unused category |
| `GET` | `/api/products` | Search and list products |
| `GET` | `/api/products/:id` | Return one product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Archive a product |
| `POST` | `/api/inventory/stock-in` | Receive stock |
| `POST` | `/api/inventory/stock-out` | Release stock |
| `GET` | `/api/inventory/transactions` | Return stock history |
| `GET` | `/api/reports/inventory` | Return the inventory report |

## Data integrity and security

- API input is validated before database access.
- SQL values are passed through typed query parameters.
- Passwords are stored as bcrypt hashes.
- Protected endpoints verify signed JWTs.
- Management actions enforce server-side roles.
- Stock movement uses a serializable database transaction and row lock.
- Database constraints prevent duplicate barcodes and negative quantities.
- Secrets are loaded from `.env`, which is excluded from Git.

## Testing

The unit suite currently covers product validation and stock calculations, including insufficient-stock rejection.

```powershell
npm test
```

Before submission, also test the API against a local SQL Server instance and walk through login, product CRUD, stock-in, stock-out, history, and CSV export in the browser.

## Challenges encountered

### Migrating away from a backend-as-a-service

The source prototype used Supabase and PostgreSQL functions. For this assessment, the data layer was redesigned as an explicit Express REST API backed by MSSQL. Database functions became parameterized service queries and transactions.

### Protecting inventory accuracy

A stock-out request must never create negative stock, including when two users submit changes close together. The API reads and updates the product inside a serializable transaction with an update lock, then writes the corresponding history entry before committing.

### Balancing speed and traceability

Inventory staff need fast workflows, while managers need a reliable audit trail. The interface keeps stock movement focused and short, while every confirmed change records the previous quantity, new quantity, user, time, and notes.

## Scope

This submission focuses on the requested authentication, CRUD, REST API, MSSQL, and reporting requirements. Advanced functionality from the earlier prototype—such as sales returns, offline caching, receipt verification, and FEFO batch allocation—is intentionally outside this assessment build.
