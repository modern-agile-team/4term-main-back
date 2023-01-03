import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { UserProfile } from '../entity/user-profile.entity';
import { Profile, ProfileDetail } from '../interface/user.interface';

@EntityRepository(UserProfile)
export class UserProfilesRepository extends Repository<UserProfile> {
  async getUserProfile(userNo: number): Promise<Profile> {
    try {
      const userProfile: Profile = await this.createQueryBuilder(
        'user_profiles',
      )
        .leftJoin('user_profiles.profileImage', 'profileImages')
        .select([
          'user_profiles.userNo AS userNo',
          'user_profiles.gender AS gender',
          'user_profiles.nickname AS nickname',
          'profileImages.imageUrl AS profileImage',
        ])
        .where('user_profiles.userNo = :userNo', { userNo })
        .getRawOne();

      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 프로필 조회 오류(getUserProfile): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUserProfile(userProfile: ProfileDetail): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'user_profiles',
      )
        .insert()
        .into(UserProfile)
        .values(userProfile)
        .execute();
      const { insertId }: ResultSetHeader = raw;

      return insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 프로필 생성 오류(createUserProfile): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
