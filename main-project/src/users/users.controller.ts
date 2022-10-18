import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:nickname')
  @ApiOperation({ summary: '유저정보 불러오기' })
  async readUserInfo(@Param('nickname') nickname: string): Promise<object> {
    const readUser = await this.usersService.readUser(nickname);
    const response = {
      success: true,
      msg: '유저정보를 성공적으로 불러왔습니다.',
      readUser,
    };

    return response;
  }
}
