import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('회원가입 기능')
export class AuthController {
  constructor(private authService: AuthService) {}
  //로그인
  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  async signIn(@Body() email: AuthDto): Promise<object> {
    const status = await this.authService.signIn(email);
    const response = {
      status,
    };

    return response;
  }

  // @Post('/check/email')
  // @ApiOperation({ summary: '이메일 중복 체크' })
  // async checkemail(@Body() { email }: AuthDto): Promise<any> {
  //   const checkEmail = await this.authService.checkEmail(email);
  //   const response = {
  //     success: true,
  //     msg: '사용가능한 이메일입니다.',
  //     checkEmail,
  //   };
  //   return response;
  // }
}
