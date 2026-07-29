import { badRequest } from "../utils/AppError.js";

/**
 * Validates `req.body` against a Zod schema, replacing it with the parsed
 * (and sanitised/typed) result. Throws a 400 with field errors on failure.
 */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(badRequest("Validation failed", details));
  }
  req.body = result.data;
  next();
};
