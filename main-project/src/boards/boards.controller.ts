import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { ParticipationDto } from './dto/participation.dto';
import { BoardDto } from './dto/board.dto';
import { Board } from './interface/boards.interface';
import { BoardFilterDto } from './dto/board-filter.dto';
import { Cron, CronExpression } from '@nestjs/schedule/dist';
import { APIResponse } from 'src/common/interface/interface';

@Controller('boards')
@ApiTags('게시글 API')
export class BoardsController {
  constructor(private boardService: BoardsService) {}
  //Cron
  @Cron(CronExpression.EVERY_HOUR)
  @Patch()
  async closingThunder(): Promise<void> {
    await this.boardService.closeThunder();
  }

  //Get Methods
  @Get()
  @ApiOperation({
    summary: '게시글 필터링 API',
    description: '게시글 필터링해서 내림차순으로 조회한다.',
  })
  async getBoards(
    @Query() BoardFilterDto: BoardFilterDto,
  ): Promise<APIResponse> {
    const boards: Board[] = await this.boardService.getBoards(BoardFilterDto);

    return { response: boards };
  }

  @Get('/:boardNo')
  @ApiOperation({
    summary: '게시글 상세조회 API',
    description: '게시글 번호를 사용해 상세조회한다.',
  })
  async getBoardByNo(@Param('boardNo') boardNo: number): Promise<APIResponse> {
    const board: Board = await this.boardService.getBoardByNo(boardNo);

    return { response: board };
  }

  // Post Methods
  @Post()
  @ApiOperation({
    summary: '게시글 생성 API',
    description: '입력한 정보로 게시글, 멤버 정보을 생성한다.',
  })
  async createBoard(@Body() createBoarddto: BoardDto): Promise<APIResponse> {
    // TODO: userNo -> jwt
    await this.boardService.createBoard(createBoarddto);

    return { msg: '게시글 생성 성공' };
  }

  @Post('/:boardNo/:userNo/bookmark')
  @ApiOperation({
    summary: '북마크 생성 API',
    description: '게시글 번호를 통해 해당 User의 북마크를 생성한다.',
  })
  async createBookmark(
    @Param() params: { [key: string]: number },
  ): Promise<APIResponse> {
    // TODO: userNo -> jwt
    const { boardNo, userNo } = params;
    await this.boardService.createBookmark(boardNo, userNo);

    return { msg: '북마크 생성 성공' };
  }

  @Post('/:boardNo/participation')
  @ApiOperation({
    summary: '게스트 참가 신청 API',
    description: '',
  })
  async createParticipation(
    @Param('boardNo') boardNo: number,
    @Body() participationDto: ParticipationDto,
  ): Promise<APIResponse> {
    const participation: string = await this.boardService.createParticipation(
      boardNo,
      participationDto,
    );

    return { msg: '참가신청 성공' };
  }

  // Patch Methods
  @Patch('/:boardNo')
  @ApiOperation({
    summary: '게시글 수정 API',
    description: '입력한 정보로 게시글, 멤버 정보을 수정한다.',
  })
  // TODO: userNo -> jwt
  async updateBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() boardDto: BoardDto,
  ): Promise<APIResponse> {
    const { userNo, ...board }: BoardDto = boardDto;
    await this.boardService.editBoard(boardNo, userNo, board);

    return { msg: '게시글 수정 성공' };
  }

  // Delete Methods
  @Delete('/:boardNo')
  @ApiOperation({
    summary: '게시글 삭제 API',
    description: '게시글 번호를 사용해 게시글, 게시글 멤버 정보을 삭제한다.',
  })
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
  ): Promise<APIResponse> {
    // TODO: userNo -> jwt
    const board: string = await this.boardService.deleteBoardByNo(boardNo);

    return { msg: '게시글 삭제 성공' };
  }

  @Delete('/:boardNo/:userNo/bookmark')
  @ApiOperation({
    summary: '북마크 취소 API',
    description: '게시글 번호를 사용해 해당 User의 북마크를 취소한다.',
  })
  async cancelBookmark(
    @Param() params: { [key: string]: number },
  ): Promise<APIResponse> {
    const { boardNo, userNo } = params;
    // TODO: userNo -> jwt
    const board = await this.boardService.cancelBookmark(boardNo, userNo);

    return { msg: '북마크 취소 성공' };
  }
}
