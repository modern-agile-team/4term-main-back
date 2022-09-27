import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
@ApiTags('회원가입 기능')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  async singUp(@Body() signUpDto: SignUpDto): Promise<object> {
    try {
      const response = await this.authService.singUp(signUpDto);

      return {
        msg: `성공적으로 회원가입 되었습니다.`,
        response,
      };
    } catch (err) {
      throw err;
    }
  }
}
