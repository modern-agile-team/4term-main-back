import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '게시글 수정',
      description: '여름 참가 신청이 없을 시 멤버 정보도 수정 가능',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '게시글 수정 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userNoMismatch',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
        {
          name: 'userNoMismatch',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
        {
          name: 'alreadyExistGuest',
          example: {
            msg: '모집인원 검증(validateRecruits-service): 참가 신청이 존재 시 모집인원을 변경할 수 없습니다.',
          },
        },
      ]),
    ),
  );
}
