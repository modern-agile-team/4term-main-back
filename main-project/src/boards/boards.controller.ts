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
import { ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateGuestTeamDto } from './dto/create-guest-team.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import {
  Board,
  GuestTeam,
  BoardPagenation,
  GuestTeamPagenation,
  GuestProfile,
  HostProfile,
} from './interface/boards.interface';
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
import { ApiGetBoard } from './swagger-decorator/get-board.decorator';
import { ApiCreateBoard } from './swagger-decorator/create-board.decorator';
import { ApiGetBoards } from './swagger-decorator/get-boards.decorator';
import { ApiCreateBookmark } from './swagger-decorator/create-bookmark.decorator';
import { ApiCreateGuestTeam } from './swagger-decorator/create-guest-team.decorator';
import { ApiUpdateBoard } from './swagger-decorator/update-board.decorator';
import { ApiAcceptHostInvite } from './swagger-decorator/accept-host-iInvite.decorator';
import { ApiAcceptGuestInvite } from './swagger-decorator/accept-guest-invite.decorator';
import { GuestInviteDto } from './dto/guest-invite.dto';
import { ApiDeleteBoard } from './swagger-decorator/delete-board.decorator';
import { ApiDeleteBookmark } from './swagger-decorator/delete-bookmark.decorator';
import { ApiGetBoardsByUser } from './swagger-decorator/get- boards-by-user.decorator';
import { GetBoardByUserDto } from './dto/get-board-by-user.dto';
import { ApiGetGuestTemasByBoardNo } from './swagger-decorator/get-guest-teams-by-board-no.decorator';
import { GuestTeamPagenationDto } from './dto/guest-team-pagenation.dto';

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
  @UseInterceptors(TransactionInterceptor)
  @ApiGetBoards()
  async getBoards(
    @TransactionDecorator() manager: EntityManager,
    @Query() boardFilterDto: BoardFilterDto,
  ): Promise<APIResponse> {
    const boardPagenation: BoardPagenation = await this.boardService.getBoards(
      manager,
      boardFilterDto,
    );

    return { msg: '게시글 필터/전체 조회 성공', response: { boardPagenation } };
  }

  @Get('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetBoard()
  async getBoardByNo(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const board: Board<number[], string[], HostProfile> =
      await this.boardService.getBoard(manager, boardNo, userNo);

    return { msg: '게시글 상세조회 성공', response: { board } };
  }

  @Get('/my-page/:type')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetBoardsByUser()
  async getBoardByUser(
    @Param('type') type: GetBoardByUserDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const boards: Board<void, void, HostProfile>[] =
      await this.boardService.getBoardsByUser(manager, userNo, Number(type));

    return { msg: '유저별 게시글 조회 성공', response: { boards } };
  }

  @Get('/apply/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetGuestTemasByBoardNo()
  async getGuestTeamsByBoardNo(
    @Query() { page }: GuestTeamPagenationDto,
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const guestTeamMetaData: GuestTeamPagenation =
      await this.boardService.getGuestTeamsByBoardNo(
        manager,
        userNo,
        boardNo,
        page,
      );

    return {
      msg: '특정 게시글에 대한여름 신청내역 전체조회',
      response: { guestTeamMetaData },
    };
  }

  @Get('/apply/:boardNo/:teamNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiGetGuestTemasByBoardNo()
  async getGuestTeam(
    @Param('teamNo', ParseIntPipe) teamNo: number,
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const guestTeam: GuestTeam<number[], GuestProfile> =
      await this.boardService.getGuestTeamByTeamNo(
        manager,
        teamNo,
        boardNo,
        userNo,
      );

    return {
      msg: '여름 신청서 상세조회 성공',
      response: { guestTeam },
    };
  }

  // Post Methods
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiCreateBoard()
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
  @ApiCreateBookmark()
  async createBookmark(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createBookmark(manager, boardNo, userNo);

    return { msg: '북마크 생성 성공' };
  }

  @Post('/:boardNo/join')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiCreateGuestTeam()
  async createGuestTeam(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @GetUser() userNo: number,
    @Body() createGuestTeamDto: CreateGuestTeamDto,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.createGuestTeam(
      manager,
      userNo,
      boardNo,
      createGuestTeamDto,
    );

    return { msg: '참가신청 성공' };
  }

  // Patch Methods
  @Patch('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiUpdateBoard()
  async updateBoard(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.editBoard(manager, boardNo, userNo, updateBoardDto);

    return { msg: '게시글 수정 성공' };
  }

  @Patch('/:boardNo/invitation/host')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiAcceptHostInvite()
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

    return { msg: '호스트 수락/거절 처리 성공' };
  }

  @Patch('/:boardNo/invitation/guest')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiAcceptGuestInvite()
  async acceptGuestInvite(
    @Param('boardNo', ParseIntPipe) boardNo: number,
    @Body() { isAccepted }: GuestInviteDto,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.validateGuestInvite(
      manager,
      boardNo,
      userNo,
      isAccepted,
    );

    return { msg: '게스트 수락/거절 처리 성공' };
  }

  // Delete Methods
  @Delete('/:boardNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @ApiDeleteBoard()
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
  @ApiDeleteBookmark()
  async cancelBookmark(
    @Param('boardNo') boardNo: number,
    @GetUser() userNo: number,
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    await this.boardService.cancelBookmark(manager, boardNo, userNo);

    return { msg: '북마크 취소 성공' };
  }
}
