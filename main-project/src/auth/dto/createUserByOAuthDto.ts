import { IsEnum, IsNumber, IsString } from 'class-validator';
import { OAuthAgency } from '../interface/auth.interface';

export class CreateUserByOAuthDto {
  @IsString()
  accessToken: string;

  @IsNumber()
  @IsEnum(OAuthAgency)
  oAuthAgency: number;
}
