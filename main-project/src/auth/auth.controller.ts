import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './interface/auth.interface';
import { GetUser } from './decorator/get-user.decorator';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('회원가입 기능')
export class AuthController {
  constructor(private authService: AuthService) {}
  //로그인
  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  async signIn(@Body() { email }: AuthCredentialsDto): Promise<object> {
    const status = await this.authService.signIn(email);
    const response = {
      status,
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

  //토큰 이용해서 유저 정보 가져오기
  @Post('/test')
  @UseGuards(AuthGuard())
  userInfoByJwt(@GetUser() user: User) {
    // console.log('req', user);
    return user;
  }
}
