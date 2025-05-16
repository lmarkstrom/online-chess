import Piece from "./piece.js";

class King extends Piece {
  constructor(color, pos) {
    super("king", color, pos);
    this.moved = false; // For castling
  }

  canMove(board, newPos) {
    const rowDiff = Math.abs(this.row - newPos.row);
    const colDiff = Math.abs(this.col - newPos.col);
    if (rowDiff <= 1 && colDiff <= 1) {
      for (let i = 0; i < 8; i += 1) {
        for (let j = 0; j < 8; j += 1) {
          if (board[i][j] !== null && board[i][j].color !== this.color) {
            if (board[i][j].canAttack(board, newPos)) {
              // alert("You cannot move your king there!");
              return false;
            }
          }
        }
      }
      return true;
    }
    return false;
  }

  canAttack(board, newPos) {
    return this.canMove(board, newPos);
  }
}

export default King;
