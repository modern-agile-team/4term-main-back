import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ProfileImages } from '../entity/profile-images.entity';

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
}
