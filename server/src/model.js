import User from "./models/user.model.js";
import Game from "./models/game.model.js";
import db from "./db.js";

class Model {
  constructor() {
    this.games = {};
    this.users = {};
    this.sessions = {};
    this.io = undefined;
  }

  async init(io) {
    this.io = io;
    await db.each("SELECT * FROM users", (err, row) => {
      this.users[row.id] = new User(row.id, row.username);
    });
    await db.each("SELECT * FROM games WHERE winner IS NULL", (err, row) => {
      this.games[row.id] = new Game(row.id, row.game_name, row.host, row.opponent, row.user_1, row.user_2, row.game_board, row.game_history, row.current_player, row.current_piece, row.winner, row.check_, row.enpassant);
    });
    console.log(this.users);
    console.log(this.games);
  }

  findGameById(id) {
    return this.games[id];
  }
  findUserById(id) {
    return this.users[id];
  }
  findUserByName(username) {
    for (const id in this.users) {
      if (this.users[id].username === username) {
        return this.users[id];
      }
    }
  }
  createSession(user_id, id) {
    this.sessions[id] = {user_id, time: new Date()};
    console.log("Created session " + this.sessions[id]);
    return id;
  }

  removeSession(user_id) {
    for (const id in this.sessions) {
      if (this.sessions[id].user_id === user_id) {
        delete this.sessions[id];
        console.log(this.sessions);
        return;
      }
    }
  }
  getGamesForUser(user_id) {
    const games = [];
    for (const id in this.games) {
      if (this.games[id].user_1 === user_id || this.games[id].user_2 === user_id || this.games[id].user_2 === null) {
        games.push(this.games[id]);
      }
    }
    return games;
  }
  findSessionById(id){
    return this.sessions[id];
  }

  createGame(id, game_name, host, user_1, user_2, game_board, game_history) {
    console.log("1");
    this.games[id] = new Game(id, game_name, host, null, user_1, user_2, game_board, game_history, "w", null, null, null, null);
    console.log("Game created ok!");
  }

  removeGame(id) {
    delete this.games[id];
  }
  broadcastGamelistUpdate(game) {
    this.io.emit("gamelistUpdate", game);
  }
  broadcastGameUpdate(game) {
    this.io.emit("gameUpdate", game);
  }
  broadcastBooked(id, student){
    this.io.emit("booked", {id: id, student: student});
  }

  /**
   * Join a specified room.
   * @param {String} socketID - An unique identifier for the user socket.io session.
   * @param {Room} room - The room to join.
   * @returns {void}
   */
  join(socketId, room) {
    this.io.in(socketId).socketsJoin(room.name);
  }
}

export default new Model();
