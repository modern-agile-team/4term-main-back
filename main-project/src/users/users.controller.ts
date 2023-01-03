import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/profile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '유저 프로필 생성' })
  async createUserProfile(
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    await this.usersService.createUserProfile(createProfileDto, profileImage);
    return { success: true };
  }
}
