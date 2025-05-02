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

publicRouter.post("/newGame", async (req, res) => {
  const { user_1, user_2 } = req.body;
  const new_game = new Chess();
  const board_string = JSON.stringify(new_game.board);
  const history_string = JSON.stringify(new_game.moveHistory);
  let game_id = null;
  await db.run(
    "INSERT INTO games (user_1, user_2, game_board, game_history, turn, finished) VALUES (?, ?, ?, ?, ?, ?)",
    [user_1, user_2, board_string, history_string, new_game.currentPlayer, 0],
  );
  db.each("SELECT last_insert_rowid() AS id", (err, row) => {
    model.newGame(row.id, user_1, user_2, new_game.board, new_game.moveHistory, new_game.currentPlayer);
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

export default { publicRouter, privateRouter };