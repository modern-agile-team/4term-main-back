import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entity/board.entity';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController');
  // logger는 middle ware로 분리 필요

  constructor(private boardService: BoardsService) {}

  @HttpCode(200)
  @Get()
  getAllBoards(): Promise<Board[]> {
    this.logger.debug(`Get all boards.`);

    return this.boardService.getAllBoards();
    // 바로 return이 아닌 변수로 빼서 return 필요
  }

  @Get('/:boardNo')
  getBoardByNo(@Param('boardNo') boardNo: number): Promise<Board> {
    this.logger.debug(`Get board by boardNo.`);

    return this.boardService.getBoardByNo(boardNo);
  }

  @Post()
  createBoard(
    @Body()
    createBoarddto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardService.createBoard(createBoarddto);
  }

  @Delete('/:boardNo')
  deleteBoard(@Param('boardNo', ParseIntPipe) boardNo): Promise<boolean> {
    return this.boardService.deleteBoardByNo(boardNo);
  }
}
