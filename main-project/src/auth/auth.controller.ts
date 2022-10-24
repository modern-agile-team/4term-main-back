import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { AuthDto } from './dto/auth.dto';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './interface/auth.interface';
import { GetUser } from './decorator/get-user.decorator';

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
  //로그인
  @Post('/signin')
  // @UseGuards(AuthGuard())
  @ApiOperation({ summary: '로그인' })
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<object> {
    const jwtToken = await this.authService.signIn(authCredentialsDto);
    const response = { jwtToken, msg: '성공적으로 토큰이 발행되었습니다.' };

    return response;
  }

  //토큰 이용해서 유저 정보 가져오기
  @Post('/test')
  @UseGuards(AuthGuard())
  userInfoByJwt(@GetUser() user: User) {
    // console.log('req', user);
    return user;
  }

  // @Delete('/:userNo')
  // @ApiOperation({ summary: '회원 탈퇴 기능' })
  // async signDown(@Param('userNo') userNo: number): Promise<object> {
  // const user = await this.authService.deleteUserByNo(userNo);
  // return user;
  // }
}
