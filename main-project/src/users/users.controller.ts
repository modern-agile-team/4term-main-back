import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/:userNo/profile/create')
  @ApiOperation({ summary: ' 로그인 시 status : 0' })
  async createUserProfile(
    @Param('userNo') userNo: number,
    @Body() createUserDto: CreateUserDto,
  ) {
    await this.usersService.createUserProfile(userNo, createUserDto);
    return { success: true };
  }

  @Patch('/:userNo/profile/update')
  @ApiOperation({ summary: '로그인 시 status : 1, 2' })
  async updateUserProfile(
    @Param('userNo') userNo: number,
    @Body() { description }: UpdateUserProfileDto,
  ) {
    await this.usersService.updateUserProfile(userNo, description);

    return { success: true };
  }
}
