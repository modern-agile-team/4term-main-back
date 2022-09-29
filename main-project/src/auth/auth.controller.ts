import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { UserProfileDto } from 'src/users/dto/user-profile.dto';

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
  // @Post('/createprofile')
  // @ApiOperation({
  //   summary: '유저 정보입력 api',
  //   description: '회원가입후 정보를 입력한다',
  // })
  // async createProfile(@Body() userProfileDto: UserProfileDto): Promise<object> {
  //   try {
  //     const response = await this.authService.createProfile(userProfileDto);

  //     return {
  //       msg: `회원정보가 입력되었습니다.`,
  //       response,
  //     };
  //   } catch (err) {
  //     throw err;
  //   }
  // }
}
