import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSnakeCase } from '../utils/case-transform.util';

/**
 * Converts every outgoing response body to snake_case, matching the
 * frontend's existing (Supabase-derived) types. See case-transform.util.ts
 * for why this exists instead of changing every entity/type by hand.
 */
@Injectable()
export class SnakeCaseResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => toSnakeCase(data)));
  }
}
