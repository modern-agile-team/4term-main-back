import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Body, Post, Patch, Put, UseGuards } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './interface/user.interface';
import { UsersService } from './users.service';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary:
      '유저 프로필 생성, 프로필 이미지 추가 시 image를 키값으로 form-data 전송',
  })
  @UseInterceptors(FileInterceptor('image'))
  @Post('/profile')
  async createUserProfile(
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const user: User = await this.usersService.createUserProfile(
      createProfileDto,
      profileImage,
    );

    return { response: { user } };
  }

  @ApiOperation({ summary: '유저 프로필 수정(status가 2인 유저만 요청 가능)' })
  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  async updateProfile(
    @GetUser() userNo: number,
    @Body() updateProfielDto: UpdateProfileDto,
  ) {
    const user: User = await this.usersService.updateUserProfile(
      userNo,
      updateProfielDto,
    );

    return { response: { user } };
  }

  @ApiOperation({
    summary: '유저 프로필 이미지 수정(status가 2인 유저만 요청 가능)',
  })
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @Put('/profile-image')
  async updateImage(
    @GetUser() userNo: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const accessToken: string = await this.usersService.updateProfileImage(
      userNo,
      image,
    );

    return { response: { accessToken } };
  }
}
