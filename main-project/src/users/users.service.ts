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
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ProfileImagesRepository } from './repository/profile-images.repository';
import { UserStatus } from 'src/common/configs/user-status.config';
import { Users } from './entity/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SearchedUser, User, UserImage } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/auth/interface/auth.interface';
import { ConfigService } from '@nestjs/config';
import { UserCertificatesRepository } from './repository/user-certificates.repository';
import { UserCertificates } from './entity/user-certificate.entity';
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private readonly userRepository: UsersRepository,
    private readonly userProfileRepository: UserProfilesRepository,
    private readonly profileImageRepository: ProfileImagesRepository,
    private readonly userCertificateRepository: UserCertificatesRepository,
    private readonly awsService: AwsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUserProfile(
    userNo: number,
    createProfileDto: CreateProfileDto,
    profileImage: Express.Multer.File,
  ): Promise<User> {
    const user = await this.getUserByNo(userNo);
    if (user.status != UserStatus.NO_PROFILE) {
      throw new BadRequestException(`프로필을 만들 수 없는 유저입니다.`);
    }

    await this.validateUserNickname(createProfileDto.nickname);
    const userProfileNo: number = await this.saveUserProfile(
      userNo,
      createProfileDto,
    );

    const imageUrl = await this.getProfileImageUrl(profileImage, userNo);
    await this.saveProfileImage(userProfileNo, imageUrl);
    await this.updateUserStatus(userNo, UserStatus.NO_CERTIFICATE);

    return { userNo, status: UserStatus.NO_CERTIFICATE };
  }

  async updateUserProfile(
    userNo: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const { nickname, description } = updateProfileDto;
    if (!nickname && !description) {
      throw new BadRequestException('변경 사항이 하나 이상 있어야 합니다.');
    }

    await this.updateProfile(userNo, updateProfileDto);

    const user: User = {
      userNo,
      status: UserStatus.CONFIRMED,
    };
    if (nickname) {
      user.accessToken = await this.updateAccessToken(userNo);
    }

    return user;
  }

  async updateProfileImage(
    userNo: number,
    profileImage: Express.Multer.File,
  ): Promise<string> {
    if (!profileImage) {
      throw new BadRequestException('프로필 이미지를 추가해 주세요');
    }

    const { imageUrl, profileNo }: UserImage =
      await this.profileImageRepository.getProfileImage(userNo);
    if (imageUrl) {
      await this.awsService.deleteFile(imageUrl);
    }

    const newImageUrl: string = await this.awsService.uploadProfileImage(
      userNo,
      profileImage,
    );
    await this.updateProfileImageByProfileNo(profileNo, newImageUrl);

    return await this.updateAccessToken(userNo);
  }

  async softDeleteUser(userNo: number) {
    const isUserDeleted: number = await this.userRepository.softDeleteUser(
      userNo,
    );
    if (!isUserDeleted) {
      throw new InternalServerErrorException('유저 탈퇴 오류입니다.');
    }

    await this.cacheManager.del(userNo);
  }

  async createUserCertificate(
    userNo: number,
    file: Express.Multer.File,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('학적 증명 파일을 첨부해 주세요.');
    }

    const { status }: Users = await this.getUserByNo(userNo);
    if (status != UserStatus.NO_CERTIFICATE) {
      throw new BadRequestException(
        '학적 증명 파일을 추가할 수 없는 유저입니다.',
      );
    }

    await this.saveUserCertificate(userNo, file);
    await this.updateUserStatus(userNo, UserStatus.NOT_CONFIRMED);

    return { userNo, status: UserStatus.NOT_CONFIRMED };
  }

  async resubmitCertificate(
    userNo: number,
    major: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const { status }: Users = await this.getUserByNo(userNo);
    if (status !== UserStatus.DENIED) {
      throw new BadRequestException('학적 정보를 수정할 수 없는 유저입니다.');
    }

    await this.deleteCertificateFile(userNo);
    await this.updateCertificateFile(userNo, file);
    await this.updateMajor(userNo, major);
    await this.updateUserStatus(userNo, UserStatus.NOT_CONFIRMED);

    return { userNo, status: UserStatus.NOT_CONFIRMED };
  }

  private async updateCertificateFile(
    userNo: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const certificate = await this.awsService.uploadCertificate(userNo, file);
    const isCertificateUpdated =
      await this.userCertificateRepository.updateCertificate(
        userNo,
        certificate,
      );

    if (!isCertificateUpdated) {
      throw new InternalServerErrorException('학적 정보 수정 오류입니다.');
    }
  }

  private async updateMajor(userNo: number, major: string): Promise<void> {
    const isMajorUpdated: number =
      await this.userProfileRepository.updateUserMajor(userNo, major);

    if (!isMajorUpdated) {
      throw new InternalServerErrorException('학적 정보 수정 에러');
    }
  }

  async confirmUser(adminNo: number, userNo: number) {
    await this.validateAdminAuthority(adminNo);

    const { status }: Users = await this.getUserByNo(userNo);
    if (status !== UserStatus.NOT_CONFIRMED) {
      throw new BadRequestException('학적 인증 수락을 할 수 없는 유저입니다.');
    }

    await this.deleteCertificateFile(userNo);
    await this.deleleCertificate(userNo);
    await this.updateUserStatus(userNo, UserStatus.CONFIRMED);
  }

  async getUserByNickname(nickname: string): Promise<SearchedUser[]> {
    return await this.userProfileRepository.getUserByNickname(nickname);
  }

  async deleteHaltedUsers(): Promise<void> {
    await this.userRepository.deleteHaltedUsers();
  }

  async isValidNickname(nickname: string): Promise<boolean> {
    const user: Users = await this.userProfileRepository.getUserBySameNickname(
      nickname,
    );

    return !Boolean(user);
  }

  async denyUserCertificate(adminNo: number, userNo: number): Promise<void> {
    await this.validateAdminAuthority(adminNo);

    const user: Users = await this.getUserByNo(userNo);
    if (user.status !== UserStatus.NOT_CONFIRMED) {
      throw new BadRequestException('학적 정보를 반려할 수 없는 유저입니다.');
    }

    await this.updateUserStatus(userNo, UserStatus.DENIED);
  }

  private async updateProfile(
    userNo: number,
    updatedProfile: UpdateProfileDto,
  ): Promise<void> {
    if (updatedProfile.nickname) {
      await this.validateUserNickname(updatedProfile.nickname);
    }

    const isProfileUpdated: number =
      await this.userProfileRepository.updateUserProfile(
        userNo,
        updatedProfile,
      );

    if (!isProfileUpdated) {
      throw new InternalServerErrorException(`유저 프로필 수정 오류입니다.`);
    }
  }

  private async validateUserNickname(nickname: string) {
    if (nickname.match(/\s/g)) {
      throw new BadRequestException('닉네임에 공백이 포함되어 있습니다.');
    }

    if (!(await this.isValidNickname(nickname))) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }
  }

  private async validateAdminAuthority(adminNo: number): Promise<void> {
    const { isAdmin }: Users = await this.getUserByNo(adminNo);

    if (!isAdmin) {
      throw new UnauthorizedException('관리자 계정이 아닙니다.');
    }
  }

  private async deleteCertificateFile(userNo: number): Promise<void> {
    const { certificate }: UserCertificates =
      await this.userCertificateRepository.getCertifiacateByNo(userNo);

    if (!certificate) {
      throw new NotFoundException(`학적 인증 정보가 없는 유저입니다.`);
    }

    await this.awsService.deleteFile(certificate);
  }

  private async deleleCertificate(userNo: number): Promise<void> {
    const isCertificateDeleted: number =
      await this.userCertificateRepository.deleteCerticificate(userNo);

    if (!isCertificateDeleted) {
      throw new InternalServerErrorException(
        '학적 정보가 삭제되지 않았습니다.',
      );
    }
  }

  private async saveUserCertificate(
    userNo: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const certificate = await this.awsService.uploadCertificate(userNo, file);
    const isCertificateSaved: number =
      await this.userCertificateRepository.createCertificate(
        userNo,
        certificate,
      );

    if (!isCertificateSaved) {
      throw new InternalServerErrorException('학적 증명 파일 추가 오류입니다.');
    }
  }

  private async updateProfileImageByProfileNo(
    profileNo: number,
    imageUrl: string,
  ) {
    const isProfileImageUpdated: number =
      await this.profileImageRepository.updateProfileImage(profileNo, imageUrl);

    if (!isProfileImageUpdated) {
      throw new InternalServerErrorException(`프로필 이미지 수정 오류입니다.`);
    }
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

    return await this.awsService.uploadProfileImage(userNo, image);
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
    userNo: number,
    createProfileDto: CreateProfileDto,
  ): Promise<number> {
    const userProfileNo: number =
      await this.userProfileRepository.createUserProfile({
        userNo,
        ...createProfileDto,
      });

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
