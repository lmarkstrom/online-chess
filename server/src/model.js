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
      this.games[row.id] = new Game(
        row.id,
        row.gameName,
        row.host,
        row.opponent,
        row.user_1,
        row.user_2,
        row.gameBoard,
        row.gameHistory,
        row.current_player,
        row.current_piece,
        row.winner,
        row.checker,
        row.enpassant
      );
      console.log(this.games[row.id]);
    });
    const users = await db.all(
      "SELECT DISTINCT user_1 AS userID FROM games UNION SELECT DISTINCT user_2 FROM games;"
    );

    console.log("Users:", users);

    // Iterate over each user and fetch their stats
    for (const user of users) {
      const { userID } = user;

      const stats = await db.get(
        `SELECT 
                    COUNT(*) AS total_games,
                    SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS total_wins
                FROM games
                WHERE (user_1 = ? OR user_2 = ?) AND winner IS NOT NULL;`,
        [userID, userID, userID]
      );
      this.userStats[userID] = {
        totalGames: stats?.total_games || 0,
        totalWins: stats?.total_wins || 0,
      };
    }
    console.log(`User stats ${JSON.stringify(this.userStats)}`);
  }

  findGameById(id) {
    console.log(this.games[id]);
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
    return id;
  }

  removeSession(userID) {
    for (const id in this.sessions) {
      if (this.sessions[id].userID === userID) {
        delete this.sessions[id];
        return;
      }
    }
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
      console.log(`Total games: ${user.totalGames}`);
      console.log(`Total wins: ${user.totalWins}`);
      console.log(`Win ratio: ${user.totalWins / user.totalGames}`);
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
    console.log(`User stats updated for ${userID}`);
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
    console.log(`Broadcasting win: ${winner}`);
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
