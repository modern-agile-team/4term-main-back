import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { AuthService } from './auth.service';

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
}
