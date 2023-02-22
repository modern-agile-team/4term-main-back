import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetCurrentChatLog() {
  return applyDecorators(
    ApiOperation({
      summary: '현재 채팅 내역',
      description: '채팅방에 들어갔을때 가장 최신 채팅 내역 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('현재 채팅 내역 반환', undefined, {
        currentChatLog: [
          {
            chatLogNo: 37,
            userNo: 10,
            message: 'adad',
            sendedTime: '2023-02-06T23:02:11.953Z',
          },
          {
            chatLogNo: 36,
            userNo: 9,
            message: 'adad',
            sendedTime: '2023-02-06T23:02:09.926Z',
          },
          {
            chatLogNo: 35,
            userNo: 9,
            message: '123123',
            sendedTime: '2023-02-06T23:02:00.969Z',
          },
          {
            chatLogNo: 34,
            userNo: 10,
            message: 'asd',
            sendedTime: '2023-02-06T22:59:18.973Z',
          },
          {
            chatLogNo: 33,
            userNo: 9,
            message: 'asd',
            sendedTime: '2023-02-06T22:59:17.696Z',
          },
          {
            chatLogNo: 29,
            userNo: 10,
            message: '안녕하세요',
            sendedTime: '2023-02-02T22:22:49.545Z',
          },
          {
            chatLogNo: 28,
            userNo: 9,
            message: '하이 ㅋㅋ',
            sendedTime: '2023-02-02T22:22:44.489Z',
          },
          {
            chatLogNo: 27,
            userNo: 10,
            message: '아아아아아아아',
            sendedTime: '2023-02-02T22:20:22.787Z',
          },
          {
            chatLogNo: 26,
            userNo: 10,
            message: '테스트 테스트 ',
            sendedTime: '2023-02-02T22:20:21.146Z',
          },
          {
            chatLogNo: 25,
            userNo: 9,
            message: '님은 뭐함? ㅋㅋ',
            sendedTime: '2023-02-02T22:20:15.510Z',
          },
          {
            chatLogNo: 24,
            userNo: 9,
            message: '밥먹음 ',
            sendedTime: '2023-02-02T22:20:13.068Z',
          },
          {
            chatLogNo: 23,
            userNo: 10,
            message: '님 뭐함?',
            sendedTime: '2023-02-02T22:20:09.128Z',
          },
          {
            chatLogNo: 22,
            userNo: 10,
            message: '하이 ㅋㅋㅋ',
            sendedTime: '2023-02-02T22:20:04.534Z',
          },
          {
            chatLogNo: 21,
            userNo: 9,
            message: '하이 ㅋㅋ',
            sendedTime: '2023-02-02T22:20:01.517Z',
          },
          {
            chatLogNo: 20,
            userNo: 9,
            message: 'ㅁㅇ',
            sendedTime: '2023-02-02T22:19:58.958Z',
          },
          {
            chatLogNo: 19,
            userNo: 10,
            message: 'ㅁㅇ',
            sendedTime: '2023-02-02T22:19:57.628Z',
          },
          {
            chatLogNo: 18,
            userNo: null,
            message: 'ㅁㅇㅁㅇ',
            sendedTime: '2023-02-02T22:19:45.623Z',
          },
          {
            chatLogNo: 17,
            userNo: 9,
            message: 'ㅁㅇㅁㅇ',
            sendedTime: '2023-02-02T22:19:37.296Z',
          },
          {
            chatLogNo: 16,
            userNo: null,
            message: 'ㅇㅁㅇ',
            sendedTime: '2023-02-02T22:19:35.222Z',
          },
          {
            chatLogNo: 14,
            userNo: 9,
            message: '55',
            sendedTime: '2023-02-02T22:19:25.359Z',
          },
          {
            chatLogNo: 13,
            userNo: 9,
            message: 'ad',
            sendedTime: '2023-02-01T17:44:39.928Z',
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
