import { Chess, EnPassant } from "./chess.js";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "./piece.js";

class Game extends Chess { 
    constructor(id, game_name, host, opponent, user_1, user_2, board_text, history_text, current_player, current_piece, winner, check, enpassant_text) {
      super();
      this.id = id;
      this.game_name = game_name;
      this.host = host;
      this.opponent = opponent;
      this.user_1 = user_1;
      this.user_2 = user_2;
      this.board = this.buildBoard(this.parseString(board_text));
      this.moveHistory = this.parseString(history_text);
      this.currentPlayer = current_player;
      this.currentPiece = current_piece;
      this.winner = winner;
      this.check = !!check;
      this.enpassant = enpassant_text ? this.buildEnPassant(this.parseString(enpassant_text)) : new EnPassant();
    }
    parseString(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return null;
        }
    }
    buildEnPassant(enpassant_string) {
        this.enpassant = new EnPassant();
        if (enpassant_string) {
            if (enpassant_string) {
                this.enpassant.row = enpassant_string.row;
                this.enpassant.col = enpassant_string.col;
                this.enpassant.color = enpassant_string.color;
            }
        }
    }
    buildBoard(board) {
        const newBoard = [];
        for(let i = 0; i < board.length; i++) {
            newBoard[i] = [];
            for(let j = 0; j < board[i].length; j++) {
                if(board[i][j] === null) {
                    newBoard[i][j] = null;
                    continue;
                }
                const col = board[i][j].color;
                switch(board[i][j].name) {
                    case "pawn":
                        newBoard[i][j] = new Pawn(col, {row: i, col: j});
                        break;
                    case "rook":
                        newBoard[i][j] = new Rook(col, {row: i, col: j});
                        break;
                    case "knight":
                        newBoard[i][j] = new Knight(col, {row: i, col: j});
                        break;
                    case "bishop":
                        newBoard[i][j] = new Bishop(col, {row: i, col: j});
                        break;
                    case "queen":
                        newBoard[i][j] = new Queen(col, {row: i, col: j});
                        break;
                    case "king":
                        newBoard[i][j] = new King(col, {row: i, col: j});
                        break;
                    default:
                        newBoard[i][j] = null;
                }
            }
        }
        return newBoard;
    }
 }
 export default Game;