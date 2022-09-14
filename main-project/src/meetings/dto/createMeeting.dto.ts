import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from 'src/users/entity/user.entity';

export class CreateMeetingDto {
  @IsNotEmpty()
  @ApiProperty({
    example: [1, 2, 3],
    description: '약속 주최자 측 정보, 배열 0번지가 게시물 작성자',
    required: true,
  })
  host: Users[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
    required: true,
  })
  location: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
    required: true,
  })
  time: Date;
}
