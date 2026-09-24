# Local Setup Guide

This guide explains how to run the Inventory Management System on Windows with a local Microsoft SQL Server database.

## 1. Prerequisites

Install the following tools:

- [Node.js 20 or newer](https://nodejs.org/)
- [Microsoft SQL Server 2022 Developer Edition](https://www.microsoft.com/en-us/evalcenter/download-sql-server-2022)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/sql/ssms/)
- Git

SQL Server Developer Edition is free for development and testing. It must not be used as a production database.

## 2. Install SQL Server

Run the SQL Server installer as an administrator and use these options:

1. Select **Custom** installation.
2. Select **New SQL Server stand-alone installation**.
3. Select the **Developer** edition.
4. Enable **Database Engine Services** under Feature Selection.
5. Create a **default instance** named `MSSQLSERVER`.
6. Select **Mixed Mode (SQL Server authentication and Windows authentication)**.
7. Set a strong password for the `sa` account and store it securely.
8. Select **Add Current User** to make your Windows account a SQL Server administrator.
9. Complete the installation.

Do not use the Evaluation edition. Developer Edition provides the required database features without a time limit for development and testing.

## 3. Enable TCP/IP

The API connects to SQL Server over TCP port `1433`.

1. Open **SQL Server Configuration Manager**.
2. Open **SQL Server Network Configuration**.
3. Select **Protocols for MSSQLSERVER**.
4. Right-click **TCP/IP** and select **Enable**.
5. Open **TCP/IP Properties**, then select the **IP Addresses** tab.
6. Under `IPAll`, clear `TCP Dynamic Ports` and set `TCP Port` to `1433`.
7. Open **SQL Server Services**.
8. Restart **SQL Server (MSSQLSERVER)**.

No inbound Windows Firewall rule is needed when the application and SQL Server run on the same computer.

## 4. Create the database

1. Open SQL Server Management Studio.
2. Connect using:

   ```text
   Server name: localhost
   Authentication: SQL Server Authentication
   Login: sa
   Password: the password selected during installation
   Trust server certificate: enabled
   ```

3. Select **File > Open > File** and open `database/001_schema.sql` from this repository.
4. Select **Execute**.
5. Refresh the **Databases** folder in Object Explorer.
6. Confirm that `InventoryManagement` exists and contains these tables:

   - `dbo.users`
   - `dbo.categories`
   - `dbo.products`
   - `dbo.stock_transactions`

The schema script is safe to run again. It only creates the database objects that do not already exist.

## 5. Configure environment variables

From the repository root, create the local environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and update the database password and JWT secret:

```dotenv
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=8h
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=InventoryManagement
DB_USER=sa
DB_PASSWORD=replace-with-your-sql-server-password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
SEED_ADMIN_EMAIL=admin@inventory.local
SEED_ADMIN_PASSWORD=Admin123!
```

Generate a suitable JWT secret with Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value after `JWT_SECRET=`. Never commit `.env`; it contains local credentials and is already excluded by `.gitignore`.

## 6. Install dependencies and seed data

Run these commands from the repository root:

```powershell
npm install
npm run seed
```

A successful seed prints:

```text
Seed complete. Administrator: admin@inventory.local
```

The seed is repeatable. It does not duplicate the administrator, default categories, or demonstration products.

## 7. Start the application

Start the API and client together:

```powershell
npm run dev
```

Open the following addresses:

- Application: <http://localhost:5173>
- API health check: <http://localhost:4000/api/health>

Use the default development account:

```text
Email: admin@inventory.local
Password: Admin123!
```

The credentials can be changed in `.env` before running the seed for the first time.

## 8. Verify the installation

Complete this short check after signing in:

1. Confirm that the dashboard loads without an API error.
2. Open Products and verify the two demonstration products.
3. Create or edit a product.
4. Record a stock-in transaction.
5. Record a stock-out transaction.
6. Confirm both entries appear in transaction history.
7. Export the inventory report.

For a complete code check, run:

```powershell
npm run lint
npm test
npm run build
```

## Troubleshooting

### Login failed for user `sa`

- Confirm SQL Server was installed with Mixed Mode authentication.
- Confirm the password in `.env` exactly matches the `sa` password.
- Confirm the `sa` login is enabled in SSMS under **Security > Logins**.
- Restart SQL Server after changing its authentication mode.

### Failed to connect to `localhost:1433`

- Confirm **SQL Server (MSSQLSERVER)** is running.
- Confirm TCP/IP is enabled for `MSSQLSERVER`.
- Confirm `IPAll > TCP Port` is `1433` and `TCP Dynamic Ports` is blank.
- Restart SQL Server after changing TCP/IP settings.
- Test the same credentials by connecting through SSMS.

### Cannot open database `InventoryManagement`

Run `database/001_schema.sql` in SSMS and confirm the query completes successfully. Then refresh the Databases folder.

### Invalid environment configuration

Confirm that `.env` exists in the repository root, not inside `client` or `server`. `JWT_SECRET` must contain at least 32 characters, and every `DB_*` value must be present.

### Port already in use

The client uses port `5173`, the API uses port `4000`, and SQL Server uses port `1433`. Stop the conflicting program or change the relevant application port. If you change the SQL Server port, update `DB_PORT` in `.env` to match.
