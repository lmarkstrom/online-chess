import Chess from "./chess.js";
import EnPassant from "./chess/enpassant.js";
import Pawn from "./chess/pawn.js";
import Rook from "./chess/rook.js";
import Knight from "./chess/knight.js";
import Bishop from "./chess/bishop.js";
import Queen from "./chess/queen.js";
import King from "./chess/king.js";

class Game extends Chess {
  constructor(
    id,
    gameName,
    host,
    opponent,
    user1,
    user2,
    boardText,
    historyText,
    currentPlayer,
    currentPiece,
    winner,
    check,
    enpassantText
  ) {
    super();
    this.id = id;
    this.gameName = gameName;
    this.host = host;
    this.opponent = opponent;
    this.user1 = user1;
    this.user2 = user2;
    this.board = Game.buildBoard(Game.parseString(boardText));
    this.moveHistory = Game.parseString(historyText);
    this.currentPlayer = currentPlayer;
    this.currentPiece = currentPiece;
    this.winner = winner;
    this.check = !!check;
    this.enpassant = enpassantText
      ? this.buildEnPassant(Game.parseString(enpassantText))
      : new EnPassant();
  }

  static parseString(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return [];
    }
  }

  buildEnPassant(enpassantString) {
    this.enpassant = new EnPassant();
    if (enpassantString) {
      if (enpassantString) {
        this.enpassant.row = enpassantString.row;
        this.enpassant.col = enpassantString.col;
        this.enpassant.color = enpassantString.color;
      }
    }
  }

  static buildBoard(board) {
    const newBoard = [];
    for (let i = 0; i < board.length; i += 1) {
      newBoard[i] = [];
      for (let j = 0; j < board[i].length; j += 1) {
        if (board[i][j] === null) {
          newBoard[i][j] = null;
        } else {
          const col = board[i][j].color;
          switch (board[i][j].name) {
            case "pawn":
              newBoard[i][j] = new Pawn(col, { row: i, col: j });
              break;
            case "rook":
              newBoard[i][j] = new Rook(col, { row: i, col: j });
              break;
            case "knight":
              newBoard[i][j] = new Knight(col, { row: i, col: j });
              break;
            case "bishop":
              newBoard[i][j] = new Bishop(col, { row: i, col: j });
              break;
            case "queen":
              newBoard[i][j] = new Queen(col, { row: i, col: j });
              break;
            case "king":
              newBoard[i][j] = new King(col, { row: i, col: j });
              break;
            default:
              newBoard[i][j] = null;
          }
        }
      }
    }
    return newBoard;
  }
}
export default Game;
