import { Router } from "express";
import model from "../model.js";
import { game } from "../index.js";
import { Chess } from "../chess.js";
import db from "../db.js";

const publicRouter = Router();
const privateRouter = Router();

publicRouter.get("/game", (req, res) => {
    res.json({
      board: game.board,
      moveHistory: game.moveHistory,
    });
  });

privateRouter.post("/newGame", async (req, res) => {
  const { user_1, username, game_name } = req.body;
  const new_game = new Chess();
  const board_string = JSON.stringify(new_game.board);
  const history_string = JSON.stringify(new_game.moveHistory);
  let game_id = null;
  await db.run(
    "INSERT INTO games (game_name, host, user_1, user_2, game_board, game_history, turn, finished) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [game_name, username, user_1, null, board_string, history_string, new_game.currentPlayer, 0],
  );
  db.each("SELECT last_insert_rowid() AS id", (err, row) => {
    model.createGame(game_id, game_name, username, user_1, null, board_string, history_string, new_game.currentPlayer);
    model.broadcastNewGame(model.findGameById(game_id));
    game_id = row.id;
  });
  res.send({ id: game_id });
});
  
publicRouter.post("/move", (req, res) => {
    const { row, col } = req.body;
  
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