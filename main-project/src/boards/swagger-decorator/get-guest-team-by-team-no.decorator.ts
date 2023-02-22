import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetGuestTemasByTeamNo() {
  return applyDecorators(
    ApiOperation({
      summary: '여름 신청서 상세조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('여름 신청서 상세조회 성공', {
        guestTeams: {
          teamNo: 4,
          title: 'tessssst',
          description: 'desc',
          guests: [16, 14],
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
        {
          name: 'isNotHostMember',
          example: {
            msg: '호스트 확인(validateHost-service): 해당 게시글의 호스트멤버가 아닙니다.',
          },
        },
        {
          name: 'guestTeamsNotFound',
          example: {
            msg: '여름 신청내역 조회(getGuestTeamsByBoardNo-service): 신청내역이 없습니다.',
          },
        },
      ]),
    ),
  );
}
