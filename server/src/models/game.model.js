import { Chess, EnPassant } from "./chess.js";

class Game extends Chess { 
    constructor(id, game_name, host, opponent, user_1, user_2, board_text, history_text, current_player, current_piece, winner, check, enpassant_text) {
      super();
      this.id = id;
      this.game_name = game_name;
      this.host = host;
      this.opponent = opponent;
      this.user_1 = user_1;
      this.user_2 = user_2;
      this.board = this.parseString(board_text);
      this.moveHistory = this.parseString(history_text);
      this.current_player = current_player;
      this.current_piece = current_piece;
      this.winner = winner;
      this.check = !!check;
      this.enpassant = enpassant_text ? this.parseJSON(enpassant_text) : new EnPassant();
    }
    parseString(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            return null;
        }
    }
 }
 export default Game;