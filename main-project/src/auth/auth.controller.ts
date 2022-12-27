import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login/kakao')
  async kakaoLogin(@Body('token') token: string) {
    await this.authService.kakaoLogin(token);

    return { success: true };
  }

  @Post('/login/google')
  async googleLogin(@Body('token') token: string) {
    await this.authService.googleLogin(token);

    return { success: true };
  }

  @Post('/login/naver')
  async naverLogin(@Body('token') token: string) {
    await this.authService.naverLogin(token);

    return { success: true };
  }

  @Post('/signIn')
  async signIn(@Body() signInDto: SignInDto) {
    await this.authService.signIn(signInDto);

    return { success: true };
  }

  @Post('/verify')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user = await this.authService.verifyEmail(verifyEmailDto);

    return { success: true, response: { user } };
  }
}
