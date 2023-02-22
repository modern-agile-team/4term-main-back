import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiRefuseRequests() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 신청 거절',
      description:
        'friendNo(친구 목록No) senderNo(보낸 유저No)를 통해 신청 거절',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '친구 신청 거절 성공 여부 반환',
        '친구 신청을 거절했습니다.',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userDuplicateNumber',
          example: { msg: '유저 번호가 중복됩니다.' },
        },
        {
          name: 'alreadyAcceptFriendRequest',
          example: { msg: '이미 친구인 상태입니다.' },
        },
        {
          name: 'FriendRequestPending',
          example: { msg: '친구 요청 대기중입니다.' },
        },
      ]),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noticeNotFound',
          example: { msg: '친구 요청이 존재하지 않습니다.' },
        },
        {
          name: 'friendRequestNotFound',
          example: { msg: '친구 요청이 존재하지 않습니다.' },
        },
      ]),
    ),
  );
}
