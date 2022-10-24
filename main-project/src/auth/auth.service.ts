import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
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
  //로그인
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

  //로그인
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    try {
      const { email } = authCredentialsDto;
      const user = await this.usersRepository.findOne({ email });

      if (user) {
        // user 토큰 생성해주기( Secret + Payload)
        // payload에는 중요한 정보를 넣으면 안됨
        const payload = { email };
        const accessToken = await this.jwtService.sign(payload);
        // 여기서 jwt에서 제공하는 sign 메소드를 통해 Secret과 Payload를 합쳐서 accessToken을 만들어줌

        return accessToken;
      } else {
        throw new UnauthorizedException('logIn failed');
      }
    } catch (error) {
      throw error;
    }
  }
  //회원탈퇴
}
