import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ProfileImages } from '../entity/profile-images.entity';
import { UserImage } from '../interface/user.interface';

@EntityRepository(ProfileImages)
export class ProfileImagesRepository extends Repository<ProfileImages> {
  async createProfileImage(
    userProfileNo: number,
    imageUrl: string,
  ): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'profileImages',
      )
        .insert()
        .into(ProfileImages)
        .values({ userProfileNo, imageUrl })
        .execute();
      const { affectedRows }: ResultSetHeader = raw;

      return affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 프로필 이미지 생성 오류(createProfileImage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getProfileImage(userNo: number): Promise<UserImage> {
    try {
      const userImage: UserImage = await this.createQueryBuilder(
        'profileImages',
      )
        .leftJoin('profileImages.userProfileNo', 'userProfiles')
        .select([
          'profileImages.imageUrl AS imageUrl',
          'userProfiles.no AS profileNo',
        ])
        .where('userProfiles.userNo = :userNo', { userNo })
        .getRawOne();

      return userImage;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 프로필 이미지 조회 오류(getProfileImage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateProfileImage(
    profileNo: number,
    imageUrl: string,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder(
        'profileImages',
      )
        .update()
        .set({ imageUrl })
        .where('profile_images.profile_no = :profileNo', { profileNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 프로필 이미지 수정 오류(updateProfileImage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
