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
import { HostInviteDto } from './dto/host-invite.dto';

@Controller('boards')
@ApiTags('게시글 API')
export class BoardsController {
  constructor(private readonly boardService: BoardsService) {}
  //Cron
  @Cron(CronExpression.EVERY_HOUR)
  @Patch()
  async closeBoard(): Promise<APIResponse> {
    await this.boardService.closeBoard();

    return { msg: 'cron : closeBoard' };
  }

  //Get Methods
  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 필터링 검색 or 전체검색 API',
    description:
      '검색조건이 있으면 필터링을 통한 검색 / 조건이 없으면 전체검색을 한다',
  })
  async getBoards(
    @TransactionDecorator() manager: EntityManager,
    @Query() BoardFilterDto?: BoardFilterDto,
  ): Promise<APIResponse> {
    const boards: Board<void>[] = await this.boardService.getBoards(
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
    const board: Board<number[]> = await this.boardService.getBoard(
      manager,
      boardNo,
    );

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

  @Post('/:boardNo/bookmark')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '북마크 생성 API',
    description: '게시글 번호를 통해 해당 User의 북마크를 생성한다.',
  })
  async createBookmark(
    @Param('boardNo') boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createBookmark(manager, boardNo, userNo);

    return { msg: '북마크 생성 성공' };
  }

  @Post('/:boardNo/participation')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게스트 참가 신청 API',
    description: '',
  })
  async createGuestTeam(
    @Param('boardNo') boardNo: number,
    @GetUser() userNo: number,
    @Body() participationDto: CreateGuestTeamDto,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createGuestTeam(
      manager,
      userNo,
      boardNo,
      participationDto,
    );

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

  @Patch('/:boardNo/invite/host')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 호스트멤버 초대 수락 / 거절 API',
    description: `게시글 작성 시 초대한 멤버가 알람에서 수락 시 
    알람에 수락처리 및 전체 수락됬는지 확인 후 전체 수락 시 
    게시글 보여지게 전환, 거절 시 게시글, 알람 삭제 및 작성자에게 
    거절 알람 전송`,
  })
  async acceptHostInvite(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() { isAccepted }: HostInviteDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.validateHostInvite(
      manager,
      boardNo,
      userNo,
      isAccepted,
    );

    return { msg: '게시글 수락 / 거절 처리 성공' };
  }

  @Patch('/:boardNo/invite/guest')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 게스트 멤버 초대 수락 / 거절 API',
    description: `여름 참가 신청멤버로 초대받은 게스트 들의 초대 수락 / 거절 API`,
  })
  async acceptGuestInvite(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() { isAccepted }: HostInviteDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.validateGuestInvite(
      manager,
      boardNo,
      userNo,
      isAccepted,
    );

    return { msg: '게시글 수락 / 거절 처리 성공' };
  }

  // Delete Methods
  @Delete('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '게시글 삭제 API',
    description: '게시글 번호를 사용해 게시글관련 정보들을 삭제한다.',
  })
  async deleteBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.deleteBoard(manager, boardNo, userNo);

    return { msg: '게시글 삭제 성공' };
  }

  @Delete('/:boardNo/bookmark')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiOperation({
    summary: '북마크 취소 API',
    description: '게시글 번호를 사용해 해당 User의 북마크를 취소한다.',
  })
  async cancelBookmark(
    @Param('boardNo') boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.cancelBookmark(manager, boardNo, userNo);

    return { msg: '북마크 취소 성공' };
  }
}
