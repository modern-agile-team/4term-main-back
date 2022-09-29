import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfileDetail } from './interface/user-profile.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:profileUserNo')
  @ApiOperation({ summary: '유저 한명의 프로필을 조회하는 API' })
  async readeUserProfile(
    // @Param('profileUserNo') userProfileDto: UserProfileDto,
    @Param('profileUserNo') profileUserNo: number,
  ): Promise<object> {
    try {
      const response = await this.usersService.readUserProfile(profileUserNo);
      return {
        msg: `프로필 조회에 성공했습니다 `,
        response,
      };
    } catch (err) {
      throw err;
    }
  }
}
