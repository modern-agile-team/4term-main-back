import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateChatRoom() {
  return applyDecorators(
    ApiOperation({
      summary: '채팅방 생성(여름 신청 수락)',
      description: '여름 신청 받은 게스트 글을 수락 시 채팅방 생성',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '채팅방 생성, 해당 유저에게 알람 전송',
        '여름 요청 수락',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: '게시물을 찾지 못했습니다.' },
        },
        {
          name: 'guestTeamNotFound',
          example: { msg: '여름 요청이 존재하지 않습니다.' },
        },
        {
          name: 'unmatchedTeamNo',
          example: { msg: '일치하는 여름 요청이 없습니다.' },
        },
        {
          name: 'alreadyExistChatRoom',
          example: { msg: '이미 생성된 채팅방 입니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'differentBoardUserNo',
          example: { msg: '게시글의 작성자만 수락할 수 있습니다.' },
        },
      ]),
    ),
  );
}
