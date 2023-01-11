import {
  HttpStatus,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  Body,
  Post,
  Patch,
  Put,
  UseGuards,
  Delete,
  Param,
  Get,
  Query,
  HttpCode,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cron } from '@nestjs/schedule';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchedUser, User } from './interface/user.interface';
import { ApiConfirmUser } from './swagger-decorator/confirm-user.decorator';
import { ApiCreateCertificate } from './swagger-decorator/create-certificate.decorator';
import { ApiCreateProfile } from './swagger-decorator/create-profile.decorator';
import { ApiUpdateCertificate } from './swagger-decorator/update-certificate.decorator';
import { ApiUpdateProfileImage } from './swagger-decorator/update-profile-image.decorator';
import { ApiUpdateProfile } from './swagger-decorator/update-profile.decorator';
import { UsersService } from './users.service';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Cron('0 0 0 * * *')
  async deleteHaltedUsers() {
    await this.usersService.deleteHaltedUsers();

    return { msg: '가입 중단 유저 목록이 삭제되었습니다.' };
  }

  @ApiCreateProfile()
  @UseInterceptors(FileInterceptor('file'))
  @Post('/:userNo/profile')
  async createUserProfile(
    @Param('userNo') userNo: number,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    const user: User = await this.usersService.createUserProfile(
      userNo,
      createProfileDto,
      profileImage,
    );

    return { msg: '프로필이 등록되었습니다.', response: { user } };
  }

  @ApiUpdateProfile()
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

    return { msg: '프로필이 수정되었습니다.', response: { user } };
  }

  @ApiUpdateProfileImage()
  @UseInterceptors(FileInterceptor('file'))
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

    return {
      msg: '프로필 이미지가 수정되었습니다.',
      response: { accessToken },
    };
  }

  @ApiCreateCertificate()
  @UseInterceptors(FileInterceptor('file'))
  @Post('/:userNo/certificate')
  async createUserCertificate(
    @Param('userNo') userNo: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user: User = await this.usersService.createUserCertificate(
      userNo,
      file,
    );

    return { msg: '유저 학적 파일이 업로드되었습니다.', response: { user } };
  }

  @ApiUpdateCertificate()
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/:userNo/denied-certificate')
  async updateUserCertificate(
    @Param('userNo') userNo: number,
    @Body('major') major: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user: User = await this.usersService.updateUserCertificate(
      userNo,
      major,
      file,
    );

    return { msg: '학적 정보가 재등록되었습니다.', response: { user } };
  }

  @ApiOperation({
    summary: '회원 탈퇴',
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async softDeleteUser(@GetUser() userNo: number) {
    await this.usersService.softDeleteUser(userNo);

    return { msg: '유저가 삭제되었습니다.' };
  }

  @ApiConfirmUser()
  @UseGuards(JwtAuthGuard)
  @Patch('/:userNo/certificate')
  async confirmUser(
    @GetUser() adminNo: number,
    @Param('userNo') userNo: number,
  ) {
    await this.usersService.confirmUser(adminNo, userNo);

    return { msg: '유저 학적 정보가 수락되었습니다.' };
  }

  @ApiOperation({
    summary: '닉네임으로 유저 조회',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserByNickname(@Query('nickname') nickname: string) {
    const users: SearchedUser[] = await this.usersService.getUserByNickname(
      nickname,
    );

    return { response: { users } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/valid-nicknames/:nickname')
  async isValidUserNickname(nickname: string) {
    const isValidNickname: boolean = await this.usersService.isValidNickname(
      nickname,
    );

    return { response: { isValidNickname } };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:userNo/certificate')
  async denyUserCertificate(
    @GetUser() adminNo: number,
    @Param('userNo') userNo: number,
  ) {
    await this.usersService.denyUserCertificate(adminNo, userNo);

    return { msg: '유저 학적 정보가 반려되었습니다.' };
  }
}
