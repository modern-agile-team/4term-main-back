import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import {
  UpdateUserInfo,
  UpdateUsersDetail,
} from './interface/user-profile.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:userNo')
  @ApiOperation({ summary: '유저정보 불러오기' })
  async readUserByNo(@Param('userNo') userNo: number): Promise<object> {
    const readUser = await this.usersService.readUserByNo(userNo);
    const response = {
      success: true,
      msg: '유저정보를 성공적으로 불러왔습니다.',
      readUser,
    };

    return response;
  }

  @Patch('/patch/:userNo')
  @ApiOperation({ summary: '유저정보 수정' })
  async updateUser(
    @Param('userNo') userNo: number,
    @Body()
    nickname: UpdateUserDto,
  ): Promise<object> {
    await this.usersService.updateUser(userNo, nickname);
    const response = {
      success: true,
      msg: `${userNo}님의 정보가 수정되었습니다`,
    };

    return response;
  }
}
