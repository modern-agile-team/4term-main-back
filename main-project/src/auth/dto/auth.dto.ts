import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsNumber()
  @IsOptional()
  status: number;
}
