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
    this.TIMEOUT = 0;
  }

  async init(io, timeout) {
    this.io = io;
    this.TIMEOUT = timeout;
    await db.each("SELECT * FROM users", (err, row) => {
      this.users[row.id] = new User(row.id, row.username);
    });
    await db.each("SELECT * FROM games WHERE winner IS NULL", (err, row) => {
      this.games[row.id] = new Game(
        row.id,
        row.gameName,
        row.host,
        row.opponent,
        row.user1,
        row.user2,
        row.gameBoard,
        row.gameHistory,
        row.currentPlayer,
        row.currentPiece,
        row.winner,
        row.checker,
        row.enpassant
      );
    });
    await db.each("SELECT * FROM sessions", (err, row) => {
      this.sessions[row.id] = { userID: row.userID, time: row.time };
    });
    this.clearSessions(this.TIMEOUT);
    const users = await db.all("SELECT id FROM users;");
    for (const user of users) {
      const userID = user.id;

      const stats = await db.get(
        `SELECT 
                    COUNT(*) AS total_games,
                    SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS total_wins
                FROM games
                WHERE (user1 = ? OR user2 = ?) AND winner IS NOT NULL;`,
        [userID, userID, userID]
      );
      this.userStats[userID] = {
        totalGames: stats?.total_games || 0,
        totalWins: stats?.total_wins || 0,
      };
    }
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
    return null;
  }

  createSession(userID, id) {
    this.sessions[id] = { userID, time: new Date() };
    db.run("DELETE FROM sessions WHERE userID = ?", [userID]);
    db.run(
      "INSERT OR REPLACE INTO sessions (userID, id, time) VALUES (?, ?, ?)",
      [userID, id, new Date()]
    );
    return id;
  }

  clearSessions(TIMEOUT) {
    for (const id in this.sessions) {
      if (!this.sessionActive(id, TIMEOUT)) {
        this.removeSession(id);
      } else console.log(`Session active: ${id}`);
    }
  }

  sessionActive(id, TIMEOUT) {
    if (this.sessions[id]) {
      const session = this.sessions[id];
      const now = new Date();
      const diff = Math.abs(now - session.time);
      if (diff > TIMEOUT) {
        this.removeSession(id);
        return false;
      }
      return true;
    }
    return false;
  }

  removeSession(userID) {
    delete this.sessions[userID];
    db.run("DELETE FROM sessions WHERE id = ?", [userID]);
  }

  getGamesForUser(userID) {
    const games = [];
    for (const id in this.games) {
      if (
        this.games[id].user1 === userID ||
        this.games[id].user2 === userID ||
        this.games[id].user2 === null
      ) {
        games.push(this.games[id]);
      }
    }
    return games;
  }

  findSessionById(id) {
    return this.sessions[id];
  }

  createGame(id, gameName, host, user1, user2, gameBoard, gameHistory) {
    this.games[id] = new Game(
      id,
      gameName,
      host,
      null,
      user1,
      user2,
      gameBoard,
      gameHistory,
      "w",
      null,
      null,
      null,
      null
    );
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
      if (user.totalGames === 0) return 1;
      return user.totalWins / user.totalGames;
    }
    console.log("User not found");
    return 0;
  }

  incrementUserStats(userID, winner, opponent) {
    if (this.userStats[userID]) {
      this.userStats[userID].totalGames += 1;
      if (userID === winner) {
        this.userStats[userID].totalWins += 1;
      }
    }
    if (this.userStats[opponent]) {
      this.userStats[opponent].totalGames += 1;
      if (opponent === winner) {
        this.userStats[opponent].totalWins += 1;
      }
    }
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

  broadcastBooked(id, student) {
    this.io.emit("booked", { id, student });
  }

  broadcastWin(winner) {
    this.io.emit("gameOver", { winner });
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
