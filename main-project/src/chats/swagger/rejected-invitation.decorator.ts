import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiRejecteInvitation() {
  return applyDecorators(
    ApiOperation({
      summary: '채팅방 초대 거절',
      description: '유저 번호, notice타입, 채팅방 번호를 통해 초대 거절',
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
      SwaggerApiResponse.success('채팅방 초대 거절', '채팅방 초대 거절 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noticeNotFound',
          example: { msg: '초대 정보가 존재하지 않습니다.' },
        },
      ]),
    ),
  );
}
