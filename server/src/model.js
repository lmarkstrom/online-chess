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
    await db.each("SELECT * FROM games WHERE finished = 0", (err, row) => {
      this.games[row.id] = new Game(row.id, row.user_1, row.user_2, row.game_board, row.game_history, row.turn);
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

  findSessionById(id){
    return this.sessions[id];
  }

  createGame(id, user_1, user_2, game_board, game_history, turn) {
    this.games[id] = new Game(id, user_1, user_2, game_board, game_history, turn);
  }

  newGame(id, user_1, user_2, game_board, game_history, turn) {
    this.games[id] = new Game(id, user_1, user_2, game_board, game_history, turn);
  }

  removeGame(id) {
    games.forEach(game => {
      delete this.games[game.id];
    });
  }

  broadcastOn(id) {
    this.io.emit("tempBlock", {id: id});
  }

  broadcastOff(id) {
    this.io.emit("tempUnBlock", {id: id});
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
