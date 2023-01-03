import axios from 'axios';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from 'src/users/repository/users.repository';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResultSetHeader } from 'mysql2/promise';
import { Profile, User } from 'src/users/interface/user.interface';
import { AuthRepository } from './repository/authentication.repository';
import { UserAuth } from './interface/auth.interface';
import { LoginDto } from './dto/login.dto';
import { UserProfilesRepository } from 'src/users/repository/user-profiles.repository';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'src/common/configs/user-status.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly userRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly userProfileRepository: UserProfilesRepository,
  ) {}

  // private UserStatus = {
  //   NO_PROFILE: 0,
  //   SHCOOL_NOT_AUTHENTICATED: 1,
  //   CONFIRMED: 2,
  // };

  async kakaoLogin(token: string): Promise<User> {
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded=utf-8',
      Authorization: 'Bearer ' + token,
    };

    const { data } = await axios({
      method: 'GET',
      url: kakaoUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = data.kakao_account;
    const user = await this.createOrGetUser(email);

    return await this.issueToken(user);
  }

  async googleLogin(token: string): Promise<User> {
    const googleUserInfoUrl =
      'https://openidconnect.googleapis.com/v1/userinfo';
    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const googleUser = await axios({
      method: 'GET',
      url: googleUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = googleUser.data;
    const user = await this.createOrGetUser(email);

    return await this.issueToken(user);
  }

  async naverLogin(token: string): Promise<User> {
    const naverUserInfoUrl = 'https://openapi.naver.com/v1/nid/me';
    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const { data } = await axios({
      method: 'GET',
      url: naverUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = data.response;
    const user = await this.createOrGetUser(email);

    return await this.issueToken(user);
  }

  async signIn({ email }: SignInDto): Promise<void> {
    await this.validateUserNotCreated(email);
    const validationKey = randomBytes(7).toString('base64url');

    await this.cacheManager.set(email, validationKey, { ttl: 310 });

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 코드(ModernAgileFourth)',
      html: `<b>${validationKey}</b>`,
    });
  }

  async verifyEmail({ email, code, password }: VerifyEmailDto): Promise<User> {
    await this.validateUserNotCreated(email);
    await this.validateEmail(email, code);

    const user: User = await this.createUserByEmail(email);
    const userAuth: UserAuth = await this.createAuthentication(
      password,
      user.userNo,
    );
    const { affectedRows }: ResultSetHeader =
      await this.authRepository.createAuth(userAuth);

    if (!affectedRows) {
      throw new InternalServerErrorException(`비밀번호 생성 오류입니다.`);
    }

    return user;
  }

  async login({ password, email }: LoginDto): Promise<User> {
    const user: User = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException(`회원가입을 하지 않은 이메일입니다.`);
    }

    const userAuth: UserAuth = await this.authRepository.findAuthByUserNo(
      user.userNo,
    );

    if (!userAuth) {
      throw new NotFoundException(
        `인증 정보가 존재하지 않는 유저입니다. 소셜 로그인을 이용해 주세요.`,
      );
    }

    if (!bcrypt.compareSync(password, userAuth.password)) {
      throw new BadRequestException(`올바르지 않은 비밀번호입니다.`);
    }

    return await this.issueToken(user);
  }

  private async createAuthentication(
    password: string,
    userNo: number,
  ): Promise<UserAuth> {
    const saltedPassword = bcrypt.hashSync(password, 3);

    return {
      password: saltedPassword,
      userNo,
    };
  }

  private async validateUserNotCreated(email: string) {
    const user = await this.userRepository.getUserByEmail(email);

    if (user) {
      throw new BadRequestException(
        `이미 가입된 회원입니다. 로그인을 이용해 주세요.`,
      );
    }
  }

  private async validateEmail(email: string, code: string) {
    const validCode = await this.cacheManager.get(email);

    if (!validCode) {
      throw new BadRequestException(
        `인증 코드가 만료됐거나 발급 이력이 없는 이메일입니다. 코드를 요청해 주세요.`,
      );
    }

    if (validCode !== code) {
      throw new BadRequestException(`올바르지 않은 인증 코드입니다.`);
    }
  }

  private async createUserByEmail(email: string): Promise<User> {
    const { insertId }: ResultSetHeader = await this.userRepository.createUser(
      email,
    );

    if (!insertId) {
      throw new InternalServerErrorException(`유저 생성 오류(createUser)`);
    }

    return { userNo: insertId, status: UserStatus.NO_PROFILE };
  }

  private async createOrGetUser(email: string): Promise<User> {
    const user: User = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return await this.createUserByEmail(email);
    }

    return user;
  }

  private async issueToken(user: User): Promise<User> {
    if (user.status != UserStatus.CONFIRMED) {
      return user;
    }

    const accessPayload: Profile =
      await this.userProfileRepository.getUserProfile(user.userNo);
    user.accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<number>('ACCESS_TOKEN_EXPIRATION'),
    });

    const { iat }: any = this.jwtService.decode(user.accessToken);
    await this.cacheManager.set(user.userNo, iat, {
      ttl: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION'),
    });

    return user;
  }
}
