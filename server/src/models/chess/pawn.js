import Piece from "./piece.js";

class Pawn extends Piece {
  constructor(color, pos) {
    super("pawn", color, pos);
  }

  canMove(board, newPos) {
    const direction = this.color === "w" ? 1 : -1;
    const startRow = this.color === "w" ? 6 : 1;
    const distance = Math.abs(this.row - newPos.row);
    if (this.row - newPos.row)
      if (this.row !== startRow && distance === 2) return false; // Max 2 steg
    if (
      this.row - newPos.row === direction ||
      this.row - newPos.row === direction * 2
    ) {
      if (this.col !== newPos.col) {
        // diagonal
        return false;
      }
      return true;
    }
    return false;
  }

  canAttack(board, newPos) {
    const directionRow = this.color === "w" ? 1 : -1;
    const directionCol = Math.abs(this.col - newPos.col);
    if (this.row - newPos.row === directionRow && directionCol === 1) {
      return true;
    }
    return false;
  }
}

export default Pawn;
