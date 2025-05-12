import User from "./models/user.model.js";
import Game from "./models/game.model.js";
import db from "./db.js";

class Model {
  constructor() {
    this.games = {};
    this.users = {};
    this.sessions = {};
    this.userStats = {};
    this.io = undefined;
  }

  async init(io) {
    this.io = io;
    await db.each("SELECT * FROM users", (err, row) => {
      this.users[row.id] = new User(row.id, row.username);
    });
    await db.each("SELECT * FROM games WHERE winner IS NULL", (err, row) => {
      this.games[row.id] = new Game(row.id, row.game_name, row.host, row.opponent, row.user_1, row.user_2, row.game_board, row.game_history, row.current_player, row.current_piece, row.winner, row.check_, row.enpassant);
      console.log(this.games[row.id]);
    });
    const users = await  
    db.all("SELECT DISTINCT user_1 AS user_id FROM games UNION SELECT DISTINCT user_2 FROM games;", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
    

    console.log("Users:", users);

    // Iterate over each user and fetch their stats
    for (const user of users) {
        const userID = user.user_id;

        const stats = await db.get(
                `SELECT 
                    COUNT(*) AS total_games,
                    SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS total_wins
                FROM games
                WHERE user_1 = ? OR user_2 = ?;`,
                [userID, userID, userID],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        this.userStats[userID] = {
            totalGames: stats?.total_games || 0,
            totalWins: stats?.total_wins || 0
        };
    }
    console.log("User stats " + JSON.stringify(this.userStats));
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
    return id;
  }

  removeSession(user_id) {
    for (const id in this.sessions) {
      if (this.sessions[id].user_id === user_id) {
        delete this.sessions[id];
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
    this.games[id] = new Game(id, game_name, host, null, user_1, user_2, game_board, game_history, "w", null, null, null, null);
  }

  updateGame(game, id) {
    this.games[id] = game;
  }

  addUser(id, username) {
    this.users[id] = new User(id, username);
  }

  getWinRatio(userID) { 
    const user = this.userStats[userID];
    if (user) {
      console.log("Total games: " + user.totalGames);
      console.log("Total wins: " + user.totalWins);
      console.log("Win ratio: " + user.totalWins / user.totalGames);
      return user.totalWins / user.totalGames;
    }
    console.log("User not found");
    return 0;
  }

  incrementUserStats(userID, winner, opponent) {
    if (this.userStats[userID]) {
      this.userStats[userID].totalGames++;
      if (userID === winner) {
        this.userStats[userID].totalWins++;
      }
    }
    if (this.userStats[opponent]) {
      this.userStats[opponent].totalGames++;
      if (opponent === winner) {
        this.userStats[opponent].totalWins++;
      }
    }
    console.log("User stats updated for " + userID);
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
    this.io.emit("booked", {id, student});
  }
  broadcastWin(winner) {
    console.log("Broadcasting win: " + winner);
    this.io.emit("gameOver", {winner});
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
