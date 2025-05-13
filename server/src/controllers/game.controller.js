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
      user_1: game.user_1,
      user_2: game.user_2,
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
  model.updateGame(game, game_id);
  await db.run(
    "UPDATE games SET opponent = ?, user_2 = ? WHERE id = ?",
    [username, user_id, game_id],
  );
  model.broadcastGameUpdate(game);
  model.broadcastGamelistUpdate(game);
  res.status(200).send({success: true});
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
    return res.status(500).send("Error creating game");
  }
  model.createGame(game_id, game_name, username, user_1, null, board_string, history_string);
  model.broadcastGamelistUpdate(model.findGameById(game_id));
  res.send({ game_id });
});
  
publicRouter.post("/move", async (req, res) => {
    const { row, col, game_id, user_id, opponent, playerColor } = req.body;
    const game = model.findGameById(game_id);
    if(playerColor !== game.currentPlayer) {
      return res.status(400).send("Not your turn");
    }
    game.handleUserClick(row, col);
    model.updateGame(game, game_id);
    model.broadcastGameUpdate(game);  
    const board_string = JSON.stringify(game.board);
    const history_string = JSON.stringify(game.moveHistory);
    const enpassant_string = JSON.stringify(game.enpassant);

    if(game.gameOver) {
      model.broadcastWin(game.winner)
    }
    const gameWinner = null;
    let winner = null;
    if(game.winner !== null) {
      winner = user_id;
      model.incrementUserStats(user_id, game.winner, opponent);
    }
    


    await db.run(
        "UPDATE games SET game_board = ?, game_history = ?, current_player = ?, winner = ?, check_ = ?, enpassant = ? WHERE id = ?",
        [board_string, history_string, game.currentPlayer, winner, game.check, enpassant_string, game_id],
      );
    res.json({
      board: game.board,
      moveHistory: game.moveHistory,
      currentPlayer: game.currentPlayer,
    });

});

privateRouter.post("/fetchGames", async (req, res) => {
    const { user_id } = req.body;
    const games = model.getGamesForUser(user_id);
    return res.send(games);
});

privateRouter.post("/fetchWinRatio", async (req, res) => {
    const { user_id } = req.body;
    const winRatio = model.getWinRatio(user_id);
    return res.send({ winRatio });
}
);

export default { publicRouter, privateRouter };