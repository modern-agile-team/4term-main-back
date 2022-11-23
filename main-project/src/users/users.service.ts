import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, QueryRunner } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileRepository } from './repository/users-profile.repository';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private userProfileRepository: UserProfileRepository,
    private readonly connection: Connection,
  ) {}

  private async getUserByNo(userNo: number): Promise<any> {
    try {
      const user = await this.usersRepository.getUserByNo(userNo);
      if (!user) {
        throw new NotFoundException(
          `${userNo} 님 정보 불러오기를 실패 했습니다.`,
        );
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(userNo: number, status: number, queryRunner: QueryRunner) {
    const { affected } = await queryRunner.manager
      .getCustomRepository(UsersRepository)
      .updateStatus(userNo, status);

    if (!affected) {
      throw new InternalServerErrorException(
        '유저 정보 업데이트에 실패하였습니다.',
      );
    }
    return affected;
  }

  async createUserProfile(userNo: number, createUserDto: CreateUserDto) {
    let queryRunner: QueryRunner;
    queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { status } = await this.getUserByNo(userNo);

      if (status != 0) {
        throw new BadRequestException(
          `status가 0인 유저에 대해서만 프로필을 생성할 수 있습니다.`,
        );
      }

      await queryRunner.manager
        .getCustomRepository(UserProfileRepository)
        .createUserProfile(userNo, createUserDto);

      // 유저 status 1로 변경
      await this.updateStatus(userNo, 1, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateUserProfile(userNo: number, description: string) {
    const { status } = await this.getUserByNo(userNo);
    if (status === 0) {
      throw new BadRequestException(`아직 프로필이 생성되지 않은 유저입니다.`);
    }
    await this.userProfileRepository.updateUserProfile(description, userNo);
  }

  async deleteUser(userNo: number): Promise<any> {
    try {
      //유저가 존재하는지 체크
      await this.getUserByNo(userNo);

      const affectedRows = await this.usersRepository.deleteUser(userNo);
      if (!affectedRows) {
        throw new InternalServerErrorException('회원탈퇴 실패하였습니다.');
      }
    } catch (error) {
      throw error;
    }
  }
}
