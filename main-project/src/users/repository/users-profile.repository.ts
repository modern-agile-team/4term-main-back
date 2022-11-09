import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserProfile } from '../entity/user-profile.entity';

@EntityRepository(UserProfile)
export class UserProfileRepository extends Repository<UserProfile> {
  async createUserProfile(
    userNo: number,
    createUserDto: CreateUserDto,
  ): Promise<any> {
    try {
      const raw: UpdateResult = await this.createQueryBuilder()
        .update(UserProfile)
        .set(createUserDto)
        .where('user_no = :userNo', { userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateUserProfile(
    description: string,
    userNo: number,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(UserProfile)
        .set({ description })
        .where('user_no = :userNo', { userNo })
        .execute();
      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
