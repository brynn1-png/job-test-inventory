import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new HttpError(404, "The requested API endpoint was not found."));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Review the submitted information.",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }

  const sqlError = error as { number?: number; message?: string };
  if (sqlError.number === 2627 || sqlError.number === 2601) {
    response.status(409).json({ message: "A record with the same unique value already exists." });
    return;
  }

  console.error(error);
  response.status(500).json({
    message: "The server could not complete the request.",
    ...(env.NODE_ENV === "development" && { detail: sqlError.message }),
  });
};
