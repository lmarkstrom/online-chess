import Piece from "./piece.js";

class Knight extends Piece {
  constructor(color, pos) {
    super("knight", color, pos);
  }

  canMove(board, newPos) {
    const rowDiff = Math.abs(this.row - newPos.row);
    const colDiff = Math.abs(this.col - newPos.col);
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
      return true;
    }
    return false;
  }

  canAttack(board, newPos) {
    return this.canMove(board, newPos);
  }
}

export default Knight;
