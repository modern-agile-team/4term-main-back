import axios from 'axios';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
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
import { User } from 'src/users/interface/user.interface';
import { AuthRepository } from './repository/authentication.repository';
import { UserAuth } from './interface/auth.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private readonly mailerService: MailerService,
    private readonly userRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  private userStatus = {
    NO_PROFILE: 0,
    SHCOOL_NOT_AUTHENTICATED: 1,
    CONFIRMED: 2,
  };

  private async createUser(email: string): Promise<User> {
    const { insertId }: ResultSetHeader = await this.userRepository.createUser(
      email,
    );

    if (!insertId) {
      throw new InternalServerErrorException(`유저 생성 오류(createUser)`);
    }

    return { userNo: insertId, status: this.userStatus.NO_PROFILE };
  }

  async kakaoLogin(token: string) {
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
  }

  async googleLogin(token: string) {
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
  }

  async naverLogin(token: string) {
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
  }

  async signIn({ email }: SignInDto) {
    await this.validateUserNotCreated(email);
    const validationKey = randomBytes(7).toString('base64url');
    await this.cacheManager.set(email, validationKey, { ttl: 310 });

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 코드(ModernAgileFourth)',
      html: `<b>${validationKey}</b>`,
    });
  }

  async verifyEmail({ email, code, password }: VerifyEmailDto) {
    await this.validateUserNotCreated(email);
    await this.validateEmail(email, code);

    const user: User = await this.createUser(email);
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

  async login({ password, email }: LoginDto) {
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

    await this.validatePassword(password, userAuth);
  }

  private async validatePassword(password: string, userAuth: UserAuth) {
    const saltedPassword = await bcrypt.hash(password, userAuth.salt);

    if (!argon2.verify(userAuth.password, saltedPassword)) {
      throw new BadRequestException(`올바르지 않은 비밀번호입니다.`);
    }
  }

  private async createAuthentication(
    password: string,
    userNo: number,
  ): Promise<UserAuth> {
    const salt = await bcrypt.genSalt();
    const saltedPassword = await bcrypt.hash(password, salt);

    return {
      password: await argon2.hash(saltedPassword),
      salt,
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
}
