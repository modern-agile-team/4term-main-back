import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class ApplicationDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    example: ['modern', 'agile', '4term'],
    description: 'guest members',
  })
  guests: [];
}
