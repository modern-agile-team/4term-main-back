import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entity/board.entity';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController');
  constructor(private boardService: BoardsService) {}

  @Get()
  getAllBoards(): Promise<Board[]> {
    this.logger.debug(`Get all boards.`);

    return this.boardService.getAllBoards();
  }

  @Get('/:boardNo')
  getBoardByNo(@Param('boardNo') boardNo: number): Promise<Board> {
    this.logger.debug(`Get board by boardNo.`);

    return this.boardService.getBoardByNo(boardNo);
  }

  @Post()
  //   @UsePipes(ValidationPipe)
  createBoard(
    @Body()
    createBoarddto: CreateBoardDto,
  ): Promise<Board> {
    // this.logger.debug(`User : ${user.username} creating a new board.`);

    return this.boardService.createBoard(createBoarddto);
  }
}
