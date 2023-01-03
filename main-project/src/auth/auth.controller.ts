import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { User } from 'src/users/interface/user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login/kakao')
  async kakaoLogin(@Body('token') token: string) {
    const user: User = await this.authService.kakaoLogin(token);

    return { response: { user } };
  }

  @Post('/login/google')
  async googleLogin(@Body('token') token: string) {
    const user: User = await this.authService.googleLogin(token);

    return { response: { user } };
  }

  @Post('/login/naver')
  async naverLogin(@Body('token') token: string) {
    const user: User = await this.authService.naverLogin(token);

    return { response: { user } };
  }

  @Post('/signIn')
  async signIn(@Body() signInDto: SignInDto) {
    await this.authService.signIn(signInDto);

    return;
  }

  @Post('/verify')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user: User = await this.authService.verifyEmail(verifyEmailDto);

    return { response: { user } };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const user: User = await this.authService.login(loginDto);

    return { response: { user } };
  }
}
