import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetFriends() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 목록 조회',
      description: '유저의 친구 목록 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('친구 목록 반환', {
        friends: [
          {
            friendUserNo: 5,
            friendNickname: 'eee',
            friendDescription: '구구단',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 9,
            friendNickname: 'iiia',
            friendDescription: '내 근육 단단',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 8,
            friendNickname: 'hhh',
            friendDescription: '눈치 백단',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 3,
            friendNickname: 'sdsa',
            friendDescription: '묭묨ㅇ',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 4,
            friendNickname: 'ddd',
            friendDescription: '주부 9단',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 7,
            friendNickname: 'ggga',
            friendDescription: '계란 지단',
            friendProfileImage: 'http....',
          },
        ],
      }),
    ),
  );
}
