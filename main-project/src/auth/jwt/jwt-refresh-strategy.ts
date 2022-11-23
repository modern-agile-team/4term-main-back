import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { UsersRepository } from 'src/users/repository/users.repository';
import { UserPayload } from '../interface/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,

    public configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(jwtFromRequest: UserPayload) {
    const user: UserPayload = jwtFromRequest;

    // if(user.token === ' accessToken'){
    //     const user = await this.authService.validateAccessToken(jwtFromRequest)
    // return user;
    // }
    // if(user.token === ' refreshToken'){
    //     await this.authService.createAccessToken(user);
    // }
  }
}
