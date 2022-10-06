import { IsNotEmpty, IsString, IsInt, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMeetingDto {
  @IsNotEmpty()
  @ApiProperty({
    example: [1, 2, 3],
    description: '약속 주최자 측 정보, 배열 0번지가 게시물 작성자',
    required: true,
  })
  host: number[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
    required: true,
  })
  location: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
    required: true,
  })
  time: Date;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 3,
    description: '원하는 게스트 인원',
    required: true,
  })
  guestHeadcount: number;
}
