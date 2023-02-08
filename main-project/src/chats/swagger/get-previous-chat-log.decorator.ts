import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetPreviousChatLog() {
  return applyDecorators(
    ApiOperation({
      summary: '이전 채팅 내역',
      description:
        '이전 채팅 내역 조회 본인이 가지고 있는 채팅 내역중 가장 낮은 logNo를 통해 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('이전 채팅 내역 반환', undefined, {
        previousChatLog: [
          {
            chatLogNo: 19,
            userNo: 10,
            sendedTime: '2023-02-02T22:19:57.628Z',
            message: 'ㅁㅇ',
          },
          {
            chatLogNo: 18,
            userNo: null,
            sendedTime: '2023-02-02T22:19:45.623Z',
            message: 'ㅁㅇㅁㅇ',
          },
          {
            chatLogNo: 17,
            userNo: 9,
            sendedTime: '2023-02-02T22:19:37.296Z',
            message: 'ㅁㅇㅁㅇ',
          },
          {
            chatLogNo: 16,
            userNo: null,
            sendedTime: '2023-02-02T22:19:35.222Z',
            message: 'ㅇㅁㅇ',
          },
          {
            chatLogNo: 14,
            userNo: 9,
            sendedTime: '2023-02-02T22:19:25.359Z',
            message: '55',
          },
          {
            chatLogNo: 13,
            userNo: 9,
            sendedTime: '2023-02-01T17:44:39.928Z',
            message: 'ad',
          },
        ],
      }),
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
      ]),
    ),
  );
}
