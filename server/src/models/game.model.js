class Game { 
    constructor(id, game_name, host, user_1, user_2, board_text, history_text, turn) {
      this.id = id;
      this.game_name = game_name;
      this.host = host;
      this.user_1 = user_1;
      this.user_2 = user_2;
      this.board = this.createBoard(board_text);
      this.moveHistory = this.createHistory(history_text);
      this.turn = turn;
    }

    createBoard(board_text) {
        const userObject = JSON.parse(board_text);
        console.log(userObject);
        return userObject;
    }
    createHistory(history_text) {
        let arr;
        try {
            arr = JSON.parse(history_text);
            console.log(arr);
          } catch (e) {
            console.error("Failed to parse:", e);
            return null;
          }
        return arr;
    }
 }
 export default Game;