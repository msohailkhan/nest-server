import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refresh_token ?? null,
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: Request, payload: { sub: string; email: string; role: string }) {
    const refreshToken = req?.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException();
    return { userId: payload.sub, email: payload.email, role: payload.role, refreshToken };
  }
}
