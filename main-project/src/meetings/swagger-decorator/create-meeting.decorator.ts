import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateMeeting() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '약속 생성',
      description: '약속 시간/장소/채팅방 번호를 입력하여 약속 생성',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('생성된 약속 번호 반환', '약속 생성 성공', {
        meetingNo: 1,
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'chatRoomNotFound',
          example: { msg: '존재하지 않는 채팅방입니다' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userNotInChatRoom',
          example: { msg: '채팅방에 참여 중인 유저가 아닙니다.' },
        },
        {
          name: 'meetingAlreadyExist',
          example: { msg: '이미 약속이 있는 채팅방입니다.' },
        },
      ]),
    ),
  );
}
