import {
  CACHE_MANAGER,
  Injectable,
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repository/users.repository';
import { SignInDto } from './dto/auth.dto';
import { UserPayload } from './interface/auth.interface';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private userStatus = {
    NO_PROFILE: 0,
    SHCOOL_NOT_AUTHENTICATED: 1,
    CONFIRMED: 2,
  };

  private async createUser(user: SignInDto): Promise<number> {
    const { insertId, affectedRows } = await this.usersRepository.createUser(
      user,
    );

    if (affectedRows != 1) {
      throw new InternalServerErrorException(
        `유저 생성(createUser): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  async getUserPayload(userNo: number): Promise<UserPayload> {
    const userPayload: UserPayload = await this.usersRepository.getUserPayload(
      userNo,
    );

    if (!userPayload) {
      throw new InternalServerErrorException(
        `유저 payload 조회(getUserPayload): 알 수 없는 서버 에러입니다.`,
      );
    }

    return userPayload;
  }

  async signIn(signInDto: SignInDto): Promise<any> {
    try {
      let user = await this.usersRepository.getUserByEmail(signInDto.email);

      if (!user) {
        const userNo: number = await this.createUser(signInDto);
        user = { userNo, status: this.userStatus.NO_PROFILE };
        return user;
      }

      if (user.status == this.userStatus.CONFIRMED) {
        const userPayload: UserPayload = await this.getUserPayload(user.userNo);
        user.token = await this.createJwtToken(userPayload);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async createJwtToken(userPayload: UserPayload) {
    try {
      const payload: UserPayload = {
        ...userPayload,
        issuer: 'modern-agile',
        expiration: this.configService.get<number>('ACCESS_TOKEN_EXPIRATION'),
      };

      const accessToken: string = this.jwtService.sign(payload);

      payload.expiration = this.configService.get<number>(
        'REFRESH_TOKEN_EXPIRATION',
      );

      const refreshToken: string = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION'),
      });

      await this.cacheManager.set(userPayload.userNo + 'access', accessToken, {
        ttl: this.configService.get<number>('ACCESS_TOKEN_EXPIRATION'),
      });
      await this.cacheManager.set(
        userPayload.userNo + 'refresh',
        refreshToken,
        { ttl: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION') },
      );

      return { accessToken };
    } catch (err) {
      throw err;
    }
  }

  async validateAccessToken(payload: UserPayload): Promise<boolean> {
    const accessToken: string = await this.cacheManager.get<string>(
      payload.userNo + 'access',
    );

    if (accessToken) {
      const accessTokenPayload: any = this.jwtService.decode(accessToken);
      if (payload.iat != accessTokenPayload.iat) {
        throw new UnauthorizedException(
          `기간이 만료된 토큰입니다. 새로 발급된 토큰으로 로그인을 시도해 주세요 ${accessToken}`,
        );
      }
    }

    return Boolean(accessToken);
  }

  async refreshToken(payload: UserPayload) {
    const refreshToken = await this.cacheManager.get<string>(
      payload.userNo + 'refresh',
    );

    if (!refreshToken) {
      throw new UnauthorizedException(
        '모든 토큰이 만료되었습니다. 로그인을 다시 해주세요.',
      );
    }

    delete payload.iat;
    delete payload.exp;
    const accessToken: string = this.jwtService.sign(payload);
    await this.cacheManager.set(payload.userNo + 'access', accessToken, {
      ttl: 60,
    });

    throw new UnauthorizedException(`${accessToken}`);
  }
}
