import { Router } from "express";
import { model } from "../index.js";
import { Chess } from "../models/chess.js";
import db from "../db.js";

const publicRouter = Router();
const privateRouter = Router();

privateRouter.post("/:gameID/fetchGameData", (req, res) => {
  const { gameID } = req.params;
  const game = model.findGameById(gameID);
  console.log("Game fetched", game);
  res.send({
    currentPlayer: game.currentPlayer,
    user1: game.user1,
    user2: game.user2,
    board: game.board,
    moveHistory: game.moveHistory,
  });
});

privateRouter.post("/joinGame", async (req, res) => {
  const { gameID, userID, username } = req.body;
  const game = model.findGameById(gameID);
  if (game.opponent) {
    return res.status(400).send("Game already has two players");
  }
  game.opponent = username;
  game.user2 = userID;
  model.updateGame(game, gameID);
  await db.run("UPDATE games SET opponent = ?, user2 = ? WHERE id = ?", [
    username,
    userID,
    gameID,
  ]);
  model.broadcastGameUpdate(game);
  model.broadcastGamelistUpdate(game);
  return res.status(200).send({ success: true });
});

privateRouter.post("/newGame", async (req, res) => {
  const { user1, username, gameName } = req.body;
  const newGame = new Chess();
  const boardString = JSON.stringify(newGame.board);
  const historyString = JSON.stringify(newGame.moveHistory);
  console.log("New game player", newGame.currentPlayer);
  let gameID = null;
  await db.run(
    "INSERT INTO games (gameName, host, opponent, user1, user2, gameBoard, gameHistory, currentPlayer, currentPiece, winner, checker, enpassant) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      gameName,
      username,
      null,
      user1,
      null,
      boardString,
      historyString,
      newGame.currentPlayer,
      null,
      null,
      null,
      null,
    ]
  );
  await db.each("SELECT last_insert_rowid() AS id", (err, row) => {
    gameID = row.id;
  });

  if (gameID === null) {
    console.log("Game ID is null");
    return res.status(500).send("Error creating game");
  }
  model.createGame(
    gameID,
    gameName,
    username,
    user1,
    null,
    boardString,
    historyString
  );
  model.broadcastGamelistUpdate(model.findGameById(gameID));
  console.log(`Game created${gameID}`);
  return res.send({ gameID });
});

publicRouter.post("/move", async (req, res) => {
  const { row, col, gameID, userID, opponent, playerColor } = req.body;
  const game = model.findGameById(gameID);
  if (playerColor !== game.currentPlayer) {
    return res.json({
      board: game.board,
      moveHistory: game.moveHistory,
      currentPlayer: game.currentPlayer,
    });
  }
  game.handleUserClick(row, col);
  model.updateGame(game, gameID);
  model.broadcastGameUpdate(game);
  const boardString = JSON.stringify(game.board);
  const historyString = JSON.stringify(game.moveHistory);
  const enpassantString = JSON.stringify(game.enpassant);

  if (game.gameOver) {
    model.broadcastWin(game.winner);
  }
  // const gameWinner = null;
  let winner = null;
  if (game.winner !== null) {
    winner = userID;
    model.incrementUserStats(userID, game.winner, opponent);
  }

  await db.run(
    "UPDATE games SET gameBoard = ?, gameHistory = ?, currentPlayer = ?, winner = ?, checker = ?, enpassant = ? WHERE id = ?",
    [
      boardString,
      historyString,
      game.currentPlayer,
      winner,
      game.check,
      enpassantString,
      gameID,
    ]
  );
  return res.json({
    board: game.board,
    moveHistory: game.moveHistory,
    currentPlayer: game.currentPlayer,
  });
});

privateRouter.post("/fetchGames", async (req, res) => {
  const { userID } = req.body;
  const games = model.getGamesForUser(userID);
  return res.send(games);
});

privateRouter.post("/fetchWinRatio", async (req, res) => {
  const { userID } = req.body;
  const winRatio = model.getWinRatio(userID);
  return res.send({ winRatio });
});

export default { publicRouter, privateRouter };
