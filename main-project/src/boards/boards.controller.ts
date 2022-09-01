import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './entity/board.entity';

@Controller('boards')
export class BoardsController {
  private logger = new Logger('BoardsController');
  constructor(private boardService: BoardsService) {}

  @Post()
  //   @UsePipes(ValidationPipe)
  createBoard(
    @Body()
    board: Board,
  ): Promise<Board> {
    this.logger.debug(`User : ${board.title} creating a new board.`);
    return this.boardService.createBoard(board);
  }
}
