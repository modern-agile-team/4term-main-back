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
            chatLogNo: 72,
            userNo: 29,
            sendedTime: '2023-03-18T14:44:50.351Z',
            field:
              'https://4term-main-project.s3.ap-northeast-2.amazonaws.com/chat/5/1671005210331_KakaoTalk_20221129_152252544.jpg, https://4term-main-project.s3.ap-northeast-2.amazonaws.com/chat/5/1671005210331_KakaoTalk_20221129_102053704.jpg, https://4term-main-project.s3.ap-northeast-2.amazonaws.com/chat/5/1671005210331_KakaoTalk_20221201_154004656.jpg, https://4term-main-project.s3.ap-northeast-2.amazonaws.com/chat/5/1671005210331_KakaoTalk_20221129_104117642.jpg, https://4term-main-project.s3.ap-northeast-2.amazonaws.com/chat/5/1671005210331_KakaoTalk_20221128_203528865.jpg',
            type: 'ImageUrl',
          },
          {
            chatLogNo: 71,
            userNo: 30,
            sendedTime: '2023-03-15T10:42:19.534Z',
            field: '노원역 어딘가/2023-03-15 18:32:22',
            type: 'Meeting',
          },
          {
            chatLogNo: 68,
            userNo: 29,
            sendedTime: '2023-03-15T10:35:42.385Z',
            field: '테테테테테테',
            type: 'Message',
          },
          {
            chatLogNo: 67,
            userNo: 29,
            sendedTime: '2023-03-15T10:35:26.741Z',
            field: '테스트트트',
            type: 'Message',
          },
          {
            chatLogNo: 66,
            userNo: 29,
            sendedTime: '2023-03-15T10:34:18.314Z',
            field: 'ㅁㅇㅁㅇ',
            type: 'Message',
          },
          {
            chatLogNo: 65,
            userNo: 29,
            sendedTime: '2023-03-15T10:04:03.419Z',
            field: '이것은 테스트이다',
            type: 'Message',
          },
          {
            chatLogNo: 57,
            userNo: 21,
            sendedTime: '2023-03-02T05:53:10.319Z',
            field: '헤헤헿',
            type: 'Message',
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
