import {
  Injectable,
  BadRequestException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UserProfilesRepository } from './repository/user-profiles.repository';
import { UsersRepository } from './repository/users.repository';
import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { ProfileImagesRepository } from './repository/profile-images.repository';
import { UserStatus } from 'src/common/configs/user-status.config';
import { Users } from './entity/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/auth/interface/auth.interface';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private userRepository: UsersRepository,
    private readonly userProfileRepository: UserProfilesRepository,
    private readonly profileImageRepository: ProfileImagesRepository,
    private readonly awsService: AwsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUserProfile(
    createProfileDto: CreateProfileDto,
    profileImage: Express.Multer.File,
  ): Promise<User> {
    const { userNo } = createProfileDto;
    const user = await this.getUserByNo(userNo);
    if (user.status != UserStatus.NO_PROFILE) {
      throw new BadRequestException(`프로필을 만들 수 없는 유저입니다.`);
    }

    const userProfileNo: number = await this.saveUserProfile(createProfileDto);
    const imageUrl = await this.getProfileImageUrl(profileImage, userNo);
    await this.saveProfileImage(userProfileNo, imageUrl);
    await this.updateUserStatus(userNo, UserStatus.SHCOOL_NOT_AUTHENTICATED);

    return { userNo, status: UserStatus.SHCOOL_NOT_AUTHENTICATED };
  }

  async updateUserProfile(updateProfileDto: UpdateProfileDto): Promise<User> {
    const user: User = {
      userNo: updateProfileDto.userNo,
      status: UserStatus.CONFIRMED,
    };

    const isProfileUpdated: number =
      await this.userProfileRepository.updateUserProfile(updateProfileDto);

    if (!isProfileUpdated) {
      throw new InternalServerErrorException(`유저 프로필 수정 오류입니다.`);
    }

    if (updateProfileDto.nickname) {
      user.accessToken = await this.updateAccessToken(updateProfileDto.userNo);
    }

    return user;
  }

  private async updateAccessToken(userNo: number) {
    const accessPayload: Payload =
      await this.userProfileRepository.getUserPayload(userNo);

    const accessToken = this.jwtService.sign(accessPayload);
    const { iat }: any = this.jwtService.decode(accessToken);
    const remainedTime = await this.cacheManager.ttl(userNo);

    await this.cacheManager.set(userNo, iat, {
      ttl:
        remainedTime === -2
          ? this.configService.get('TOKEN_EXPIRATION')
          : remainedTime,
    });

    return accessToken;
  }

  private async getProfileImageUrl(image: Express.Multer.File, userNo: number) {
    if (!image) {
      return null;
    }

    return await this.awsService.uploadProfileImage(image, userNo);
  }

  private async saveProfileImage(userProfileNo: number, imageUrl: string) {
    const isProfileImageSaved: number =
      await this.profileImageRepository.createProfileImage(
        userProfileNo,
        imageUrl,
      );

    if (!isProfileImageSaved) {
      throw new InternalServerErrorException(`유저 이미지 생성 오류입니다.`);
    }
  }

  private async saveUserProfile(
    createProfileDto: CreateProfileDto,
  ): Promise<number> {
    const userProfileNo: number =
      await this.userProfileRepository.createUserProfile(createProfileDto);

    if (!userProfileNo) {
      throw new InternalServerErrorException(`유저 프로필 생성 오류입니다.`);
    }

    return userProfileNo;
  }

  private async getUserByNo(userNo: number): Promise<Users> {
    const user: Users = await this.userRepository.getUserByNo(userNo);

    if (!user) {
      throw new BadRequestException(`존재하지 않는 유저 번호입니다.`);
    }

    return user;
  }

  private async updateUserStatus(
    userNo: number,
    status: number,
  ): Promise<void> {
    const isStatusUpdated = await this.userRepository.updateUserStatus(
      userNo,
      status,
    );

    if (!isStatusUpdated) {
      throw new InternalServerErrorException(`유저 status 수정 오류입니다.`);
    }
  }
}
