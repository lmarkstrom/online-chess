import { Router } from "express";
import model from "../model.js";
import { Chess } from "../models/chess.js";
import db from "../db.js";

const publicRouter = Router();
const privateRouter = Router();

privateRouter.post("/:game_id/fetchGameData", (req, res) => {
    const { game_id } = req.params;
    const game = model.findGameById(game_id);
    res.send({
      currentPlayer: game.currentPlayer,
      user_2: game.opponent,
      board: game.board,
      moveHistory: game.moveHistory,
    });
  });

privateRouter.post("/joinGame", async (req, res) => {
  const { game_id, user_id, username } = req.body;
  const game = model.findGameById(game_id);
  if (game.opponent) {
    return res.status(400).send("Game already has two players");
  }
  game.opponent = username;
  game.user_2 = user_id;
  await db.run(
    "UPDATE games SET opponent = ?, user_2 = ? WHERE id = ?",
    [username, user_id, game_id],
  );
  model.broadcastGameUpdate(game);
  model.broadcastGamelistUpdate(game);
  res.status(200).send({sucess: true});
});

privateRouter.post("/newGame", async (req, res) => {
  const { user_1, username, game_name } = req.body;
  const new_game = new Chess();
  const board_string = JSON.stringify(new_game.board);
  const history_string = JSON.stringify(new_game.moveHistory);
  let game_id = null;
  await db.run(
    "INSERT INTO games (game_name, host, opponent, user_1, user_2, game_board, game_history, current_player, current_piece, winner, check_, enpassant) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [game_name, username, null, user_1, null, board_string, history_string, new_game.currentPlayer, null, null, null, null],
  );
  await db.each("SELECT last_insert_rowid() AS id", (err, row) => {
    game_id = row.id;
  });
  if(game_id === null) {
    console.log("Game ID is null");
    return res.status(500).send("Error creating game");
  }
  model.createGame(game_id, game_name, username, user_1, null, board_string, history_string);
  model.broadcastGamelistUpdate(model.findGameById(game_id));
  console.log("Game created" + game_id);
  res.send({ game_id });
});
  
publicRouter.post("/move", (req, res) => {
    const { row, col, game_id } = req.body;
    const game = model.findGameById(game_id);
    game.handleUserClick(row, col);
    res.json({
      board: game.board,
      moveHistory: game.moveHistory,
    });
});

privateRouter.post("/fetchGames", async (req, res) => {
    const { user_id } = req.body;
    const games = model.getGamesForUser(user_id);
    return res.send(games);
});

export default { publicRouter, privateRouter };