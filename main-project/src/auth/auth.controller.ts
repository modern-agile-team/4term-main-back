import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('회원가입 기능')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  async singUp(@Body() signUpDto: SignUpDto): Promise<object> {
    const signup = await this.authService.signUp(signUpDto);
    const response = {
      success: true,
      msg: '성공적으로 회원가입이 되셨습니다.',
      signup,
    };
    return response;
  }

  @Post('/check/email')
  @ApiOperation({ summary: '이메일 중복 체크' })
  async checkEmail(@Body() authDto: AuthDto): Promise<object> {
    const checkEmail = await this.authService.checkEmail(authDto);
    const response = {
      success: true,
      msg: '사용가능한 이메일입니다.',
      checkEmail,
    };
    return response;
  }

  @Post('/check/nickname')
  @ApiOperation({ summary: '닉네임 중복 체크' })
  async checkNickname(@Body() authDto: AuthDto): Promise<object> {
    const checkNickname = await this.authService.checkNickname(authDto);
    const response = {
      success: true,
      msg: '사용가능한 닉네임입니다.',
      checkNickname,
    };
    return response;
  }

  // @Delete('/:userNo')
  // @ApiOperation({ summary: '회원 탈퇴 기능' })
  // async signDown(@Param('userNo') userNo: number): Promise<object> {
  // const user = await this.authService.deleteUserByNo(userNo);
  // return user;
  // }
}
