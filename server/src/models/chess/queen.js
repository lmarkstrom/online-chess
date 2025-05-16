import Piece from "./piece.js";

class Queen extends Piece {
  constructor(color, pos) {
    super("queen", color, pos);
  }

  canMove(board, newPos) {
    const rowDiff = Math.abs(this.row - newPos.row);
    const colDiff = Math.abs(this.col - newPos.col);
    if (
      rowDiff === colDiff ||
      this.row === newPos.row ||
      this.col === newPos.col
    ) {
      const directionRow = Math.sign(newPos.row - this.row);
      const directionCol = Math.sign(newPos.col - this.col);
      if (rowDiff === colDiff) {
        for (let i = 1; i < rowDiff; i += 1) {
          if (
            board[this.row + i * directionRow][this.col + i * directionCol] !==
            null
          )
            return false;
        }
      } else if (this.row === newPos.row) {
        for (
          let i = this.col + directionCol;
          i !== newPos.col;
          i += directionCol
        ) {
          if (board[this.row][i] !== null) return false;
        }
      } else if (this.col === newPos.col) {
        for (
          let i = this.row + directionRow;
          i !== newPos.row;
          i += directionRow
        ) {
          if (board[i][this.col] !== null) return false;
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

export default Queen;
