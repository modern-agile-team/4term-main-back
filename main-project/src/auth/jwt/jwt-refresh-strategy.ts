import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserPayload } from '../interface/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly authService: AuthService,
    public readonly configService: ConfigService,
  ) {
    super({
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(jwtFromRequest: UserPayload) {
    try {
      const user: UserPayload = jwtFromRequest;
      const accessTokenAvailable = await this.authService.validateAccessToken(
        user,
      );

      if (accessTokenAvailable) {
        return user;
      }

      await this.authService.refreshToken(user);
    } catch (error) {
      console.log(error);
    }
  }
}
