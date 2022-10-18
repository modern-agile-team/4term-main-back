import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileDetail } from 'src/auth/interface/auth.interface';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  async readUser(nickname: string): Promise<object> {
    try {
      const user = await this.usersRepository.readUser(nickname);

      if (!user) {
        throw new NotFoundException(
          `${nickname}님 정보 불러오기를 실패 했습니다.`,
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
