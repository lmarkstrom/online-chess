import Piece from "./piece.js";

class Bishop extends Piece {
  constructor(color, pos) {
    super("bishop", color, pos);
  }

  canMove(board, newPos) {
    const rowDiff = Math.abs(this.row - newPos.row);
    const colDiff = Math.abs(this.col - newPos.col);
    if (rowDiff === colDiff) {
      const directionRow = Math.sign(newPos.row - this.row);
      const directionCol = Math.sign(newPos.col - this.col);
      for (let i = 1; i < rowDiff; i += 1) {
        if (
          board[this.row + i * directionRow][this.col + i * directionCol] !==
          null
        )
          return false;
      }
      return true;
    }
    return false;
  }

  canAttack(board, newPos) {
    return this.canMove(board, newPos);
  }
}

export default Bishop;
