import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MessagePayloadDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 3,
  })
  chatRoomNo: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '안녕하세요',
  })
  message: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    example: ['http', 'http'],
  })
  uploadedFileUrls: string[];
}
