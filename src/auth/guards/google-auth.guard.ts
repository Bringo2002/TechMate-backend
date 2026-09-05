import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext): TUser {
    if (err || !user) {
      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorMsg = encodeURIComponent(
        err?.message || info?.message || 'Google authentication failed',
      );
      res.redirect(`${frontendUrl}/login?error=${errorMsg}`);
      return null as any;
    }
    return user;
  }
}
