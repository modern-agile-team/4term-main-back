import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:userNo')
  // @UseGuards(AuthGuard())
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

  // @Patch('/patch/:userNo')
  // // @UseGuards(AuthGuard())
  // @ApiOperation({ summary: '유저정보 수정' })
  // async updateUser(
  //   @Param('userNo') userNo: number,
  //   @Body()
  //   nickname: UpdateUserDto,
  // ): Promise<object> {
  //   await this.usersService.updateUser(userNo, nickname);
  //   const response = {
  //     success: true,
  //     msg: `${userNo}님의 정보가 수정되었습니다`,
  //   };

  //   return response;
  // }

  @Delete('/signDown/:userNo')
  async signDown(@Param('userNo') userNo: number): Promise<object> {
    try {
      await this.usersService.signDown(userNo);

      return {
        msg: `성공적으로 회원탈퇴가 진행되었습니다.`,
      };
    } catch (err) {
      throw err;
    }
  }
}
