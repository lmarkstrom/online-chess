import { Player } from "./player.js";
import { Pawn, Rook, Knight, Bishop, Queen } from "./piece.js";

const board = [];

const boardHolder = document.getElementById("board");

export class Chess {
    constructor() {
        this.player_1 = new Player("Player 1");
        this.player_2 = null;
        this.board = [];
        this.currentPlayer = "w"; // player 0 = white, player 1 = black
        this.currentPiece = null;
        this.winner = null;
        this.gameOver = false;
        this.moveHistory = [];

        this.placePieces();
        this.drawBoard();
    }

    placePieces() {
        for (let i = 0; i < 8; i++) {
            board[i] = [];
            for (let j = 0; j < 8; j++) {
                if(i === 1) board[i][j] = new Pawn("b", {row: i, col: j});
                else if(i === 6) board[i][j] = new Pawn("w", {row: i, col: j});
                else if(i === 0){
                    if(j === 0 ||j === 7) board[i][j] = new Rook("b", {row: i, col: j});
                    else if(j === 1 || j === 6) board[i][j] = new Knight("b", {row: i, col: j});
                    else if(j === 2 || j === 5) board[i][j] = new Bishop("b", {row: i, col: j});
                    else if(j === 3) board[i][j] = new Queen("b", {row: i, col: j});
                    else board[i][j] = null;
                } else if(i === 7){
                    if(j === 0 ||j === 7) board[i][j] = new Rook("w", {row: i, col: j});
                    else if(j === 1 || j === 6) board[i][j] = new Knight("w", {row: i, col: j});
                    else if(j === 2 || j === 5) board[i][j] = new Bishop("w", {row: i, col: j});
                    else if(j === 4) board[i][j] = new Queen("w", {row: i, col: j});
                    else board[i][j] = null;
                }else board[i][j] = null;
            }
        }
    }

    drawBoard() {
        boardHolder.innerHTML = ""; // clear board
        for(let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement("div");
                square.className = "square";
                square.dataset.row = i;
                square.dataset.col = j;
                square.style.backgroundColor = (i + j) % 2 === 0 ? "#eee" : "#444";
                square.addEventListener("click", () => this.handleUserClick(i, j));
                if (board[i][j] !== null) {
                    const img = document.createElement("img");
                    img.src = board[i][j].img;
                    img.alt = board[i][j].name;
                    img.className = "piece"; 
                    square.appendChild(img);
                }
                boardHolder.appendChild(square);
            }
        }
    }

    setSquareActive(row, col, piece) {
        this.currentPiece = piece;
        document.querySelectorAll(".square").forEach(square => {
            const r = parseInt(square.dataset.row);
            const c = parseInt(square.dataset.col);
            square.style.backgroundColor = (r + c) % 2 === 0 ? "#eee" : "#444";
        });
        const index = row * 8 + col;
            const square = document.querySelectorAll(".square")[index];
            square.style.backgroundColor = "green";
    }
    setSquareInactive() {
        this.currentPiece = null;
        document.querySelectorAll(".square").forEach(square => {
            const r = parseInt(square.dataset.row);
            const c = parseInt(square.dataset.col);
            square.style.backgroundColor = (r + c) % 2 === 0 ? "#eee" : "#444";
        });
    }

    addPosToHistory(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const from = files[col] + (8 - row);
        const to = files[col] + (8 - row);
        const move = `${from} → ${to}`;
        this.moveHistory.push(move);
        console.log(move);
        this.drawHistory();
    }

    drawHistory() {
        const historyEl = document.getElementById("history-list");
        historyEl.innerHTML = "";
        this.moveHistory.forEach((move, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${move}`;
            historyEl.appendChild(li);
        });
    }

    handleUserClick(row, col) {
        if (this.gameOver) return;
        if(this.currentPiece === null ||  (board[row][col] !== null && board[row][col].color === this.currentPlayer)) {
            if(board[row][col] !== null){
                if(board[row][col].color !== this.currentPlayer) {
                    alert("You can only move your own pieces!");
                    return;
                    
                }
            }else return;
            this.setSquareActive(row, col, board[row][col]);
        } else {
            if(board[row][col] !== null) {
                if(board[row][col].color !== this.currentPlayer) {
                    if(this.currentPiece.canAttack(board, {row: row, col: col})) {
                        this.attack(board[row][col]);
                    }
                }
            } else {
                if(this.currentPiece.canMove(board, {row: row, col: col})) {
                    this.move(row, col);
                }
            }
        }
    }

    move(row, col) {
        board[row][col] = this.currentPiece;
        board[this.currentPiece.row][this.currentPiece.col] = null;
        this.currentPiece.row = row;
        this.currentPiece.col = col;
        this.setSquareInactive();
        this.drawBoard();
        this.addPosToHistory(row, col);
    }

    attack(target) {
        board[target.row][target.col] = this.currentPiece;
        board[this.currentPiece.row][this.currentPiece.col] = null;
        this.currentPiece.row = target.row;
        this.currentPiece.col = target.col;
        this.drawBoard();
        this.addPosToHistory(target.row, target.col);
    }
}