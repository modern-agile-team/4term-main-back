import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  private async createUser(email: string) {
    try {
      const { insertId, affectedRows } = await this.usersRepository.createUser(
        email,
      );

      if (affectedRows == 1) {
        throw new InternalServerErrorException('');
      }
      return insertId;
    } catch (err) {
      throw err;
    }
  }

  async signIn(authDto: AuthDto): Promise<any> {
    try {
      let user = await this.usersRepository.getUserByEmail(authDto.email); //userNo, status 받아올거
      //(처음 로그인 할 때)
      if (!user) {
        const userNo = await this.createUser(authDto.email);
        user = { userNo, status: 0 };
      }

      //(회원가입이 되었고, 학적이 확인이 된 유저 일 때 토큰을 줌)
      if (user.status == 2) {
        const payload = { userNo: user.no };
        user.accessToken = await this.jwtService.sign(payload);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  //유저 이메일 중복체크
  async checkEmail(email: string): Promise<any> {
    try {
      const user = await this.usersRepository.checkEmail(email);
      console.log(user);
      if (user) {
        throw new ConflictException(`이미 사용중인 이메일입니다.`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
