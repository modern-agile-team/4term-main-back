import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}
  //회원생성
  async signUp(signUpDto: SignUpDto): Promise<number> {
    try {
      const { affectedRows, insertId } = await this.usersRepository.signUp(
        signUpDto,
      );

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`유저 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }
  //유저 닉네임 중복체크
  async checkNickname(authDto: AuthDto): Promise<object> {
    try {
      const user = await this.usersRepository.checkNickname(authDto.nickname);

      if (user) {
        throw new ConflictException(`이미 사용중인 닉네임입니다.`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
  //유저 이메일 중복체크
  async checkEmail(authDto: AuthDto): Promise<object> {
    try {
      const user = await this.usersRepository.checkEmail(authDto.email);

      if (user) {
        throw new ConflictException(`이미 사용중인 이메일입니다.`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  //회원탈퇴
}
