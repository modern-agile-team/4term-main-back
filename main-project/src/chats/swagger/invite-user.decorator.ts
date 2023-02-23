import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiInviteUser() {
  return applyDecorators(
    ApiOperation({
      summary: '채팅방 초대 API',
      description: '알람을 통해 채팅방 초대',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '채팅방 초대시 초대 알람 생성',
        '채팅방 초대 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'chatRoomNotFound',
          example: { msg: '존재하지 않는 채팅방입니다.' },
        },
        {
          name: 'userNotFoundInChatRoom',
          example: { msg: '채팅방에서 ( )님의 정보를 찾을 수 없습니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'existingChatRoomUser',
          example: { msg: '채팅방에 이미 ( )님이 존재합니다.' },
        },
        {
          name: 'alreadyInvitedUser',
          example: { msg: '이미 초대를 보낸 상태입니다.' },
        },
      ]),
    ),
  );
}
