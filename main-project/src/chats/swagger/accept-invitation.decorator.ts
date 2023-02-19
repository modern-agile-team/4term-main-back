import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { number } from 'joi';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiAcceptInvitation() {
  return applyDecorators(
    ApiOperation({
      summary: '채팅방 초대 수락 ',
      description: '유저 번호, 타입, 채팅방 번호를 통해 초대 수락',
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          senderNo: {
            type: 'number',
            minLength: 1,
            example: 9,
            nullable: false,
            description: '초대한 유저의 userNo',
          },
          receiverNo: {
            type: 'number',
            minLength: 1,
            example: 9,
            nullable: false,
            description: '초대받은 유저의 userNo',
          },
          type: {
            type: 'number',
            maxLength: 1,
            nullable: false,
            description: '알람 typeNo',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('채팅방 초대 수락', '채팅방 초대 성공'),
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
        {
          name: 'incorrectUserNumber',
          example: { msg: '초대받은 유저만 수락할 수 있습니다.' },
        },
        {
          name: 'invalidNoticeType',
          example: { msg: '잘못된 Notice 타입입니다.' },
        },
      ]),
    ),
  );
}
