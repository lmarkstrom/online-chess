import Piece from "./piece.js";

class Rook extends Piece {
  constructor(color, pos) {
    super("rook", color, pos);
    this.moved = false; // For castling
  }

  canMove(board, newPos) {
    if (this.row === newPos.row) {
      if (this.col < newPos.col) {
        for (let i = this.col + 1; i <= newPos.col; i += 1) {
          if (board[this.row][i] !== null) return false;
        }
        return true;
      }
      if (this.col > newPos.col) {
        for (let i = this.col - 1; i >= newPos.col; i -= 1) {
          if (board[this.row][i] !== null) return false;
        }
        return true;
      }
    }
    if (this.col === newPos.col) {
      if (this.row < newPos.row) {
        for (let i = this.row + 1; i <= newPos.row; i += 1) {
          if (board[i][this.col] !== null) return false;
        }
        return true;
      }
      if (this.row > newPos.row) {
        for (let i = this.row - 1; i >= newPos.row; i -= 1) {
          if (board[i][this.col] !== null) return false;
        }
        return true;
      }
    }
    return false;
  }

  canAttack(board, newPos) {
    if (this.row === newPos.row || this.col === newPos.col) {
      const directionRow = Math.sign(newPos.row - this.row);
      const directionCol = Math.sign(newPos.col - this.col);
      if (
        Math.abs(this.row - newPos.row) === 1 ||
        Math.abs(this.col - newPos.col) === 1
      ) {
        return true;
      }
      if (directionRow !== 0) {
        if (
          this.canMove(board, {
            row: newPos.row - directionRow,
            col: newPos.col,
          })
        )
          return true;
        return false;
      }
      if (directionCol !== 0) {
        if (
          this.canMove(board, {
            row: newPos.row,
            col: newPos.col - directionCol,
          })
        )
          return true;
        return false;
      }
    }
    return false;
  }
}

export default Rook;
