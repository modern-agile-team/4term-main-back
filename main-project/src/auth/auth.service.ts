import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthDto } from './dto/auth.dto';
import { UserPayload } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
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
        return { userNo, status: 0 };
      }

      //(회원가입이 되었고, 학적이 확인이 된 유저 일 때 토큰을 줌)
      if (user.status == 2) {
        // getUserPayload => userNo, isAdmin, email leftjoin 해서 nickname 리턴받기
        // await this.createJwtToken 메서드 호출해서 생성된 token 리턴 받기
        await this.getUserPayload(user);
        await this.createJwtToken(user);
        // user.accessToken = await this.jwtService.sign(payload);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
  async getUserPayload(userNo: number): Promise<any> {
    try {
      const user = await this.usersRepository.getUserPayload(userNo);

      if (!user) {
        throw new InternalServerErrorException('');
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

  async createJwtToken(user) {
    try {
      const payload: UserPayload = {
        userNo: user.no,
        email: user.email,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        issuer: 'modern-agile',
        expiration: this.configService.get<number>('EXPIRES_IN'),
        token: 'accessToken',
      };
      const accessToken: string = this.jwtService.sign(payload);

      payload.expiration = 60 * 60;
      // this.configService.get<number>(
      //   'REFRESH_TOKEN_EXPIRES_IN',
      // );
      payload.token = 'refreshToken';

      const refreshToken: string = this.jwtService.sign(payload, {
        //이 코드처럼 configService에서 값 받아오고 있는 부분은 적용하기 어려우면 값을 바로 넣어서 코드 작성 가능
        // ex) secret : "abc1234",
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: 60 * 60,
        // expiresIn: this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN'),
      });

      return { accessToken, refreshToken };
    } catch (err) {
      throw err;
    }
  }
}
