import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthUser, UserRole } from "../types/auth.js";

type TokenPayload = {
  sub: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export function createAccessToken(user: AuthUser) {
  return jwt.sign(
    { fullName: user.fullName, email: user.email, role: user.role },
    env.JWT_SECRET,
    { subject: user.id, expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
  );
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  return {
    id: payload.sub,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
  };
}

