import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;  // userId
  role: string;
}

/**
 * Validates incoming JWT access tokens.
 * Extracts the user ID from the token payload and fetches the user from DB.
 * If the user doesn't exist (deleted account, etc.), rejects the request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'techmate_jwt_secret_key_production_2026_fallback'),
    });
  }

  /**
   * Called after JWT signature is verified.
   * The returned object is attached to request.user
   */
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
