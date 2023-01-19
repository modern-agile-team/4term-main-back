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
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateGuestTeamDto } from './dto/create-guest-team.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './interface/boards.interface';
import { BoardFilterDto } from './dto/board-filter.dto';
import { Cron, CronExpression } from '@nestjs/schedule/dist';
import { APIResponse } from 'src/common/interface/interface';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
@ApiTags('게시글 API')
export class BoardsController {
  constructor(private boardService: BoardsService) {}
  //Cron
  @Cron(CronExpression.EVERY_HOUR)
  @UseInterceptors(TransactionInterceptor)
  @Patch()
  async closingThunder(
    @TransactionDecorator() manager: EntityManager,
  ): Promise<void> {
    await this.boardService.closeBoard(manager);
  }

  //Get Methods
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 필터링 API',
    description: '게시글 필터링해서 내림차순으로 조회한다.',
  })
  async getBoards(
    @Query() BoardFilterDto: BoardFilterDto,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const boards: Board[] = await this.boardService.getBoards(
      manager,
      BoardFilterDto,
    );

    return { response: { boards } };
  }

  @Get('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 상세조회 API',
    description: '게시글 번호를 사용해 상세조회한다.',
  })
  async getBoardByNo(
    @Param('boardNo') boardNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const board: Board = await this.boardService.getBoardByNo(manager, boardNo);

    return { response: { board } };
  }

  // Post Methods
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 생성 API',
    description: '입력한 정보로 게시글, 멤버 정보을 생성한다.',
  })
  async createBoard(
    @Body() createBoarddto: CreateBoardDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createBoard(manager, userNo, createBoarddto);

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
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게스트 참가 신청 API',
    description: '',
  })
  async createParticipation(
    @Param('boardNo') boardNo: number,
    @Body() participationDto: CreateGuestTeamDto,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createGuestTeam(manager, boardNo, participationDto);

    return { msg: '참가신청 성공' };
  }

  // Patch Methods
  @Patch('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 수정 API',
    description: '입력한 정보로 게시글, 멤버 정보을 수정한다.',
  })
  async updateBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.editBoard(manager, boardNo, userNo, updateBoardDto);

    return { msg: '게시글 수정 성공' };
  }

  // Delete Methods
  @Delete('/:boardNo')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 삭제 API',
    description: '게시글 번호를 사용해 게시글, 게시글 멤버 정보을 삭제한다.',
  })
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    // TODO: userNo -> jwt
    await this.boardService.deleteBoardByNo(manager, boardNo);

    return { msg: '게시글 삭제 성공' };
  }

  @Delete('/:boardNo/:userNo/bookmark')
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '북마크 취소 API',
    description: '게시글 번호를 사용해 해당 User의 북마크를 취소한다.',
  })
  async cancelBookmark(
    @Param() params: { [key: string]: number },
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const { boardNo, userNo } = params;
    // TODO: userNo -> jwt
    await this.boardService.cancelBookmark(manager, boardNo, userNo);

    return { msg: '북마크 취소 성공' };
  }
}
