import { env } from "../config/env.js";

/* eslint-disable no-unused-vars */
/**
 * Global error handler. Converts AppError (and unknown errors) into a
 * consistent JSON envelope. Hides internals in production.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      message:
        status === 500 && env.nodeEnv === "production"
          ? "Internal server error"
          : err.message,
    },
  };
  if (err.details) payload.error.details = err.details;

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }
  res.status(status).json(payload);
}

export function notFoundHandler(req, res) {
  res
    .status(404)
    .json({ error: { message: `Route not found: ${req.method} ${req.path}` } });
}
