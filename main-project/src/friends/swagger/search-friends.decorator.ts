import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiSearchFriends() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 검색 ',
      description: '닉네임으로 친구 검색',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('해당하는 친구 반환', {
        searchResult: [
          {
            friendNo: 9,
            friendNickname: 'iiia',
            friendDescription: '구구단',
            friendProfileImage: 'http....',
          },
          {
            friendNo: 3,
            friendNickname: 'sdsa',
            friendDescription: '내 근육 단단',
            friendProfileImage: 'http....',
          },
          {
            friendNo: 7,
            friendNickname: 'ggga',
            friendDescription: '주부 9단',
            friendProfileImage: 'http....',
          },
        ],
      }),
    ),
  );
}
