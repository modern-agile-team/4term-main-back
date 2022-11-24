import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Users } from '../entity/user.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  // test용으로 만든 임시 메서드 - board
  async getUserByNickname(nickname: string) {
    try {
      const user = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'profile')
        .select(['users.no AS no', 'profile.nickname AS nickname'])
        .where('profile.nickname = :nickname', { nickname })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getUserByNickname-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
