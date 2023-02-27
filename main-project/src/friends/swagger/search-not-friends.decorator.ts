import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiSearchNotFriendUsers() {
  return applyDecorators(
    ApiOperation({
      summary: '친구가 아닌 유저 검색',
      description: '닉네임으로 유저 검색',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('해당하는 유저 반환', {
        searchResult: [
          {
            userNo: 27,
            nickname: '이십칠',
            description: '3',
            profileImage: null,
          },
          {
            userNo: 28,
            nickname: '이십팔',
            description: '디스크립션 ㅋㅋ',
            profileImage: null,
          },
        ],
      }),
    ),
  );
}
