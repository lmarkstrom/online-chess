import { Player } from "./player.js";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "./piece.js";



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
        this.board = [];
        this.check = false;

        this.placePieces();
        this.drawBoard();
    }

    placePieces() {
        for (let i = 0; i < 8; i++) {
            this.board[i] = [];
            for (let j = 0; j < 8; j++) {
                if(i === 1) this.board[i][j] = new Pawn("b", {row: i, col: j});
                else if(i === 6) this.board[i][j] = new Pawn("w", {row: i, col: j});
                else if(i === 0){
                    if(j === 0 ||j === 7) this.board[i][j] = new Rook("b", {row: i, col: j});
                    else if(j === 1 || j === 6) this.board[i][j] = new Knight("b", {row: i, col: j});
                    else if(j === 2 || j === 5) this.board[i][j] = new Bishop("b", {row: i, col: j});
                    else if(j === 3) this.board[i][j] = new Queen("b", {row: i, col: j});
                    else if(j === 4) this.board[i][j] = new King("b", {row: i, col: j});
                    else this.board[i][j] = null;
                } else if(i === 7){
                    if(j === 0 ||j === 7) this.board[i][j] = new Rook("w", {row: i, col: j});
                    else if(j === 1 || j === 6) this.board[i][j] = new Knight("w", {row: i, col: j});
                    else if(j === 2 || j === 5) this.board[i][j] = new Bishop("w", {row: i, col: j});
                    else if(j === 3) this.board[i][j] = new King("w", {row: i, col: j});
                    else if(j === 4) this.board[i][j] = new Queen("w", {row: i, col: j});
                    else this.board[i][j] = null;
                }else this.board[i][j] = null;
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
                if (this.board[i][j] !== null) {
                    const img = document.createElement("img");
                    img.src = this.board[i][j].img;
                    img.alt = this.board[i][j].name;
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
        console.log(this.currentPiece);
        console.log(this.currentPlayer);

        if (this.gameOver) return;
        if(this.currentPiece === null || (this.board[row][col] !== null && this.board[row][col].color === this.currentPlayer)) {
            if(this.board[row][col] !== null){
                if(this.board[row][col].color !== this.currentPlayer) {
                    alert("You can only move your own pieces!");
                    return;
                    
                }
            }else return;
            this.setSquareActive(row, col, this.board[row][col]);
        } else {
            console.log(this.board[row][col])
            if(this.board[row][col] !== null) {
                if(this.board[row][col].color !== this.currentPlayer) {
                    if(this.currentPiece.canAttack(this.board, {row: row, col: col})) {
                        this.attack(this.board[row][col]);
                    }
                }
            } else {
                console.log(this.currentPiece.canMove(this.board, {row: row, col: col}));
                if(this.currentPiece.canMove(this.board, {row: row, col: col})) {
                    this.move(row, col);
                }else alert("Invalid move!");
            }
        }
    }
    
    userMove() {
        this.currentPlayer = this.currentPlayer === "w" ? "b" : "w";
    }

    checkGameOver() {
        let color = this.currentPlayer === "w" ? "b" : "w";
        console.log(this.checkCheckmate(color));
        if(this.checkCheckmate(color) === "checkmate") {
            this.gameOver = true;
            this.winner = this.currentPlayer === "w" ? "Black" : "White";
            alert(`${this.winner} wins!`);
        }else if(this.checkCheckmate(color) === "draw") {
            this.gameOver = true;
            alert("Draw!");
        } else if(this.checkCheckmate(color) === "noCheckamte") {
            this.gameOver = false;
        } else if(this.checkCheckmate(color) === "check") {
            this.check = true;
            alert("Check!");
        }
    }
    checkCheckmate(col) {
        // const col = this.currentPlayer === "w" ? "b" : "w";
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.board[i][j] !== null && this.board[i][j].color === col && this.board[i][j].name === "king") {
                    for(let k = -1; k <= 1; k++) {
                        for(let l = -1; l <= 1; l++) {
                            if(this.board[i][j].canMove(this.board, {row: i+k, col:j+l}) && l !== 0 && k !== 0) {
                                if(!this.board[i][j].canMove(this.board, {row: i, col: j})) return "check";
                                else return "noCheckmate";
                            }
                        }
                    }
                    if(this.board[i][j].canMove(this.board, {row: i, col:j})) return "draw";
                    return "checkmate";
                }
            }
        }
    }

    move(row, col) {
        let tmp1 = this.currentPiece;
        let tmp2 = this.board[row][col];
        this.board[row][col] = this.currentPiece;
        this.board[this.currentPiece.row][this.currentPiece.col] = null;
        console.log(this.checkCheckmate(this.currentPlayer));
        if(this.checkCheckmate(this.currentPlayer) === "check"){
            alert("Invalid move!");
            this.currentPiece = tmp1;
            this.board[row][col] = tmp2;
            return;
        }
        this.currentPiece.row = row;
        this.currentPiece.col = col;
        this.setSquareInactive();
        this.drawBoard();
        this.addPosToHistory(row, col);
        this.checkGameOver();
        this.userMove();
    }

    attack(target) {
        let tmp1 = this.currentPiece;
        let tmp2 = this.board[target.row][target.col];
        this.board[target.row][target.col] = this.currentPiece;
        this.board[this.currentPiece.row][this.currentPiece.col] = null;
        console.log(this.checkCheckmate(this.currentPlayer));
        if(this.checkCheckmate(this.currentPlayer) === "check"){
            alert("Invalid move!");
            this.currentPiece = tmp1;
            this.board[target.row][target.col] = tmp2;
            return;
        }
        this.currentPiece.row = target.row;
        this.currentPiece.col = target.col;
        this.setSquareInactive();
        this.drawBoard();
        this.addPosToHistory(target.row, target.col);
        this.checkGameOver();
        this.userMove();
    }
}