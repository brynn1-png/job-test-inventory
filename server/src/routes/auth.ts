import bcrypt from "bcryptjs";
import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { HttpError } from "../lib/http-error.js";
import { createAccessToken } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { loginSchema } from "../schemas/auth.js";
import { getPool, sql } from "../database/pool.js";
import type { AuthUser, UserRole } from "../types/auth.js";

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
};

export const authRouter = Router();

authRouter.post("/login", asyncHandler(async (request, response) => {
  const input = loginSchema.parse(request.body);
  const pool = await getPool();
  const result = await pool.request()
    .input("email", sql.NVarChar(255), input.email)
    .query<UserRow>(`
      SELECT TOP (1) id, full_name, email, password_hash, role
      FROM dbo.users
      WHERE email = @email AND is_active = 1;
    `);

  const row = result.recordset[0];
  if (!row || !(await bcrypt.compare(input.password, row.password_hash))) {
    throw new HttpError(401, "The email or password is incorrect.");
  }

  const user: AuthUser = { id: row.id, fullName: row.full_name, email: row.email, role: row.role };
  response.json({ accessToken: createAccessToken(user), user });
}));

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

