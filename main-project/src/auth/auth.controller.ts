import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('회원가입 기능')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.authService.signIn(signInDto);

    return {
      msg: '유저 조회 성공',
      response: { user },
    };
  }
}
