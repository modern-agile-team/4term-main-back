import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Body, Post, Patch, UseGuards } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { BodyAndUser } from 'src/common/decorator/body-and-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './interface/user.interface';
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
    const user: User = await this.usersService.createUserProfile(
      createProfileDto,
      profileImage,
    );

    return { response: { user } };
  }

  @Patch('/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@BodyAndUser() updateProfielDto: UpdateProfileDto) {
    const user: User = await this.usersService.updateUserProfile(
      updateProfielDto,
    );

    return { response: { user } };
  }
}
