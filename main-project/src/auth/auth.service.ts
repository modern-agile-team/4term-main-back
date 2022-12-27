import axios from 'axios';
import { randomBytes } from 'crypto';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from 'src/users/repository/users.repository';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private readonly userRepository: UsersRepository,
    private readonly mailerService: MailerService,
  ) {}

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

  async signIn(signInDto: SignInDto) {
    const { email }: SignInDto = signInDto;
    await this.validateUserNotCreated(email);
    const validationKey = randomBytes(7).toString('base64url');
    await this.cacheManager.set(email, validationKey, 360);

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 코드(ModernAgileFourth)',
      html: `<b>${validationKey}</b>`,
    });
  }

  private async validateUserNotCreated(email: string) {
    const user = await this.userRepository.getUserByEmail(email);

    if (user) {
      throw new BadRequestException(
        `이미 가입된 회원입니다. 로그인을 이용해 주세요.`,
      );
    }
  }
}
