import { Router } from "express";
import model from "../model.js";
import { game } from "../index.js";

const publicRouter = Router();
const privateRouter = Router();

publicRouter.get("/game", (req, res) => {
    res.json({
      board: game.board,
      moveHistory: game.moveHistory,
    });
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