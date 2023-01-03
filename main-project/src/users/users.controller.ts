import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Body, Post } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { AwsService } from 'src/aws/aws.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly awsService: AwsService,
  ) {}

  @Post('/profile')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '유저 프로필 생성' })
  async createUserProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const result = await this.awsService.uploadProfileImage(
      file,
      createProfileDto.userNo,
    );

    return { success: true };
  }
}
