import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/jwt.js";
import type { UserRole } from "../types/auth.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) return next(new HttpError(401, "Sign in to continue."));

  try {
    request.user = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, "Your session is invalid or has expired. Sign in again."));
  }
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new HttpError(403, "Your account is not allowed to perform this action."));
    }
    next();
  };
}

