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
import { User } from 'src/users/interface/user.interface';
import { AuthRepository } from './repository/authentication.repository';
import { Payload, UserAuth } from './interface/auth.interface';
import { LoginDto } from './dto/login.dto';
import { UserProfilesRepository } from 'src/users/repository/user-profiles.repository';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'src/common/configs/user-status.config';
import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { Authentication } from './entity/authentication.entity';
import { AuthConfig } from './config/auth.config';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

    await this.cacheManager.set(email, validationKey, {
      ttl: AuthConfig.signInTokenExpiration,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: '????????? ?????? ??????(ModernAgileFourth)',
      html: `<b>${validationKey}</b>`,
    });
  }

  async verifyEmail({ email, code, password }: VerifyEmailDto): Promise<User> {
    await this.validateUserNotCreated(email);
    await this.validateEmail(email, code);

    const user: User = await this.createUserByEmail(email);
    const userAuth: UserAuth = await this.createAuthentication(
      user.userNo,
      password,
    );
    const { affectedRows }: ResultSetHeader =
      await this.authRepository.createAuth(userAuth);

    if (!affectedRows) {
      throw new InternalServerErrorException(`???????????? ?????? ???????????????.`);
    }

    return user;
  }

  async login({ password, email }: LoginDto): Promise<User> {
    const user: User = await this.getUserByEmail(email);
    const userAuth: Authentication = await this.getUserAuthentication(
      user.userNo,
    );

    await this.validatePassword(userAuth, password);

    return await this.issueToken(user);
  }

  async validateToken(tokenPayload: Payload): Promise<boolean> {
    const { userNo, iat, exp }: Payload = tokenPayload;
    const validIssuedDate = await this.cacheManager.get(userNo);

    if (!validIssuedDate) {
      throw new UnauthorizedException(`?????? ????????? ????????? ?????? ???????????????.`);
    }

    if (iat !== validIssuedDate) {
      throw new UnauthorizedException(`?????? ???????????? ????????? ??????.`);
    }

    return exp >= Date.now() / 1000;
  }

  async refreshAccessToken(payload: Payload): Promise<string> {
    const accessToken = this.jwtService.sign(payload);
    const { iat }: any = this.jwtService.decode(accessToken);

    await this.cacheManager.set(payload.userNo, iat, {
      ttl: await this.cacheManager.ttl(payload.userNo),
    });

    return accessToken;
  }

  async logout(userNo: number): Promise<void> {
    await this.cacheManager.del(userNo);
  }

  async resetLoginFailedCount(email: string): Promise<void> {
    const { userNo, status }: User = await this.getUserByEmail(email);
    if (status !== UserStatus.CONFIRMED) {
      throw new BadRequestException('?????? ?????? ????????? ????????? ?????? ???????????????.');
    }

    const { failedCount }: Authentication = await this.getUserAuthentication(
      userNo,
    );
    if (failedCount !== 5) {
      throw new BadRequestException('????????? ?????? ????????? ?????? ?????? ???????????????.');
    }

    await this.authRepository.updateFailedCount(userNo, 0);
  }

  async sendPasswordToken(email: string): Promise<void> {
    const { userNo } = await this.getUserByEmail(email);
    await this.getUserAuthentication(userNo);

    const passwordToken = randomBytes(7).toString('base64url');
    await this.cacheManager.set(passwordToken, email, {
      ttl: AuthConfig.passwordTokenExpiration,
    });

    await this.mailerService.sendMail({
      to: email,
      subject: '???????????? ?????????(ModernAgileFourth)',
      html: `<b>${passwordToken}</b>`,
    });
  }

  async resetUserPassword({ code, password }: ResetPasswordDto): Promise<void> {
    const email = await this.cacheManager.get(code);
    if (!email) {
      throw new UnauthorizedException('????????? ?????? ????????? ????????????.');
    }

    const { userNo }: User = await this.getUserByEmail(email);
    const userAuth: Authentication = await this.getUserAuthentication(userNo);
    if (bcrypt.compareSync(password, userAuth.password)) {
      throw new BadRequestException('????????? ??????????????? ????????? ?????????.');
    }

    await this.updatePassword(userNo, password);
    await this.cacheManager.del(code);
  }

  private async updatePassword(
    userNo: number,
    password: string,
  ): Promise<void> {
    const userAuth: UserAuth = await this.createAuthentication(
      userNo,
      password,
    );

    const isPasswordUpdated: number = await this.authRepository.updatePassword(
      userAuth,
    );
    if (!isPasswordUpdated) {
      throw new InternalServerErrorException('???????????? ?????? ???????????????.');
    }
  }

  private async getUserByEmail(email: string) {
    const user: User = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('??????????????? ?????? ?????? ??????????????????.');
    }

    return user;
  }

  private async getUserAuthentication(userNo: number): Promise<Authentication> {
    const userAuth: Authentication = await this.authRepository.findAuthByUserNo(
      userNo,
    );

    if (!userAuth) {
      throw new NotFoundException(
        `?????? ????????? ???????????? ?????? ?????? ????????? ???????????????.`,
      );
    }

    return userAuth;
  }

  private async validatePassword(
    userAuth: Authentication,
    password: string,
  ): Promise<void> {
    const { userNo, failedCount }: Authentication = userAuth;

    if (failedCount >= 5) {
      throw new ForbiddenException('????????? ?????? ????????? 5??? ????????? ???????????????.');
    }
    if (!bcrypt.compareSync(password, userAuth.password)) {
      await this.updateLoginFailedCount(userNo, failedCount + 1);
      throw new BadRequestException(`???????????? ?????? ?????????????????????.`);
    }

    await this.updateLoginFailedCount(userNo, 0);
  }

  private async updateLoginFailedCount(userNo: number, failedCount: number) {
    const isFailedCountUpdated: number =
      await this.authRepository.updateFailedCount(userNo, failedCount);

    if (!isFailedCountUpdated) {
      throw new InternalServerErrorException('?????? ????????? ?????? ?????? ?????? ??????');
    }
  }

  private async createAuthentication(
    userNo: number,
    password: string,
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
        `?????? ????????? ???????????????. ???????????? ????????? ?????????.`,
      );
    }
  }

  private async validateEmail(email: string, code: string) {
    const validCode = await this.cacheManager.get(email);

    if (!validCode) {
      throw new BadRequestException(
        `?????? ????????? ??????????????? ?????? ????????? ?????? ??????????????????. ????????? ????????? ?????????.`,
      );
    }

    if (validCode !== code) {
      throw new BadRequestException(`???????????? ?????? ?????? ???????????????.`);
    }
  }

  private async createUserByEmail(email: string): Promise<User> {
    const { insertId }: ResultSetHeader = await this.userRepository.createUser(
      email,
    );

    if (!insertId) {
      throw new InternalServerErrorException(`?????? ?????? ??????(createUser)`);
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

    const accessPayload: Payload =
      await this.userProfileRepository.getUserPayload(user.userNo);
    user.accessToken = this.jwtService.sign(accessPayload);

    const { iat }: any = this.jwtService.decode(user.accessToken);
    await this.cacheManager.set(user.userNo, iat, {
      ttl: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION'),
    });

    return user;
  }
}
