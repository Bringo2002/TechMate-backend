import { Request, Response, NextFunction } from 'express';
import { toCamelCase } from '../utils/case-transform.util';

/**
 * Converts incoming request bodies from snake_case (what the frontend's
 * Insert/Update types send) to camelCase (what DTOs/class-validator
 * expect), before the body reaches ValidationPipe. Runs as Express
 * middleware, so it executes before Nest's pipes.
 *
 * req.query needs special handling: Express 5 defines `query` as a getter
 * that re-parses the raw query string from scratch on every access, rather
 * than caching a single object. Mutating (or even reassigning) the object
 * returned by one access has no effect on the next access — verified this
 * against a real Express 5 server before relying on it; a compile pass
 * alone would not have caught it. The fix is to replace the property
 * descriptor itself with a plain static value via defineProperty, so every
 * later access (including Nest's @Query()) returns the same converted
 * object instead of re-invoking the original parser.
 */
export function camelCaseRequestMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = toCamelCase(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    const converted = toCamelCase(req.query as Record<string, unknown>);
    Object.defineProperty(req, 'query', {
      value: converted,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
}
