import e from "express";
import { Pawn, Rook, Knight, Bishop, Queen, King } from "./piece.js";



// const boardHolder = document.getElementById("board");
const boardHolder = null;

export class EnPassant {
    constructor() {
        this.color = null;
        this.pos = null;
        this.move = null;
    }
}

export class Chess {
    constructor() {
        this.board = [];
        this.currentPlayer = "w";
        this.currentPiece = null;
        this.winner = null;
        this.gameOver = false;
        this.moveHistory = [];
        this.board = [];
        this.check = false;
        this.enPassant = new EnPassant();

        this.placePieces();
        // this.drawBoard();
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
                    else if(j === 4) this.board[i][j] = new King("w", {row: i, col: j});
                    else if(j === 3) this.board[i][j] = new Queen("w", {row: i, col: j});
                    else this.board[i][j] = null;
                }else this.board[i][j] = null;
            }
        }
    }

    setSquareActive(row, col, piece) {
        this.currentPiece = piece;
    }
    setSquareInactive() {
        this.currentPiece = null;
    }

    addPosToHistory(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const from = files[col] + (8 - row);
        const to = files[col] + (8 - row);
        const move = `${from} → ${to}`;
        this.moveHistory.push(move);
        this.drawHistory();
    }

    drawHistory() {
        // const historyEl = document.getElementById("history-list");
        // historyEl.innerHTML = "";
        // this.moveHistory.forEach((move, index) => {
        //     const li = document.createElement("li");
        //     li.textContent = `${index + 1}. ${move}`;
        //     historyEl.appendChild(li);
        // });
    }

    handleUserClick(row, col) {
        if (this.gameOver) return;
        if(this.currentPiece === null || (this.board[row][col] !== null && this.board[row][col].color === this.currentPlayer)) {
            if(this.board[row][col] !== null){
                if(this.board[row][col].color !== this.currentPlayer) {
                    // alert("You can only move your own pieces!");
                    return;
                }else if(this.checkCastling(row, col)) {
                    this.setSquareInactive(row, col, this.board[row][col]);
                    return;
                }
            }else return;
            this.setSquareActive(row, col, this.board[row][col]);
        } else {
            if(this.board[row][col] !== null) {
                if(this.board[row][col].color !== this.currentPlayer) {
                    if(this.currentPiece.canAttack(this.board, {row: row, col: col})) {
                        this.attack(this.board[row][col]);
                    }
                }else {
                    this.checkCastling(row, col);
                }
            } else if (this.enPassantAttack(row, col)) {
                this.attackEnPassant(row, col);
            }else {
                if(this.currentPiece.canMove(this.board, {row: row, col: col}) ) {
                    this.move(row, col);
                }else {
                    // alert("Invalid move!");
                }
            }
        }
        if(this.gameOver){
            return this.winner;
        }
    }
    
    userMove() {
        this.currentPlayer = this.currentPlayer === "w" ? "b" : "w";
    }

    updateCastleMove(piece){
        if(piece.name === "king" || piece.name === "rook") {
            piece.moved = true;
        }
    }

    checkGameOver() {
        let color = this.currentPlayer === "w" ? "b" : "w";
        const res = this.checkCheckmate(color);
        console.log(res);
        if(res === "checkmate") {
            this.gameOver = true;
            this.winner = this.currentPlayer === "w" ? "Black" : "White";
            // alert(`${this.winner} wins!`);
            console.log(`${this.winner} wins!`);
        }else if(res === "draw") {
            this.gameOver = true;
            console.log("Draw!");
        } else if(res === "noCheckamte") {
            this.gameOver = false;
        } else if(res === "check") {
            this.check = true;
            console.log("Check!");
        }

    }
    isKingInCheck(color, king) {
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.board[i][j] !== null && this.board[i][j].color !== color) {
                    if(this.board[i][j].canAttack(this.board, {row: king.row, col: king.col})) {
                        // console.log("King is in check!");
                        return true;
                    }
                }
            }
        }
    }
    getAllLegalMoves(color, king) {
        let moves = [];
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.board[i][j] !== null && this.board[i][j].color === color) {
                    for(let k = 0; k < 8; k++) {
                        for(let l = 0; l < 8; l++) {
                            if(this.board[k][l] === null && this.board[i][j].canMove(this.board, {row: k, col: l})) {
                                let tmp1 = this.board[i][j];
                                let tmp2 = this.board[k][l];
                                let oldRow = this.board[i][j].row;
                                let oldCol = this.board[i][j].col;

                                this.board[k][l] = this.board[i][j];
                                this.board[i][j] = null;
                                tmp1.row = k;
                                tmp1.col = l;

                                if(!this.isKingInCheck(color, king)) {
                                    console.log("Piece on squate: " + i + ", " + j + " can move to: " + k + ", " + l);
                                    moves.push({row: k, col: l});
                                }

                                this.board[i][j] = tmp1;
                                this.board[k][l] = tmp2;
                                tmp1.row = oldRow;
                                tmp1.col = oldCol;
                            } else if(this.board[k][l] !== null && this.board[k][l].color !== color && this.board[i][j].canAttack(this.board, {row: k, col: l})) {
                                let tmp1 = this.board[i][j];
                                let tmp2 = this.board[k][l];
                                let oldRow = this.board[i][j].row;
                                let oldCol = this.board[i][j].col;

                                this.board[k][l] = this.board[i][j];
                                this.board[i][j] = null;
                                tmp1.row = k;
                                tmp1.col = l;

                                if(!this.isKingInCheck(color, king)) {
                                    console.log("Piece on squate: " + i + ", " + j + " can attack: " + k + ", " + l);
                                    moves.push({row: k, col: l});
                                }
                                this.board[i][j] = tmp1;
                                this.board[k][l] = tmp2;
                                tmp1.row = oldRow;
                                tmp1.col = oldCol;
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    checkCheckmate(color) {
        console.log("Checking game over for", color, "king.");
        let king = null;
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(this.board[i][j] !== null && this.board[i][j].name === "king" && this.board[i][j].color === color) {
                    king = this.board[i][j];
                }
            }
        }
    
        const inCheck = this.isKingInCheck(color, king);
        const allMoves = this.getAllLegalMoves(color, king);
        console.log(allMoves);
        
        if (inCheck && allMoves.length === 0) return "checkmate";
        else if (!inCheck && allMoves.length === 0) return "draw";
        else if (inCheck) return "check";
        return "noCheckmate";
    }

    move(row, col) {
        let tmp1 = this.currentPiece;
        let tmp2 = this.board[row][col];
        let oldRow = this.currentPiece.row;
        let oldCol = this.currentPiece.col;

        this.board[row][col] = this.currentPiece;
        this.board[this.currentPiece.row][this.currentPiece.col] = null;
        tmp1.row = row;
        tmp1.col = col;

        if(this.checkCheckmate(this.currentPlayer) === "check"){
            // alert("Invalid move!");
            console.log("Invalid move, still in check!");
            this.board[this.currentPiece.row][this.currentPiece.col] = tmp1;
            this.board[row][col] = tmp2;
            tmp1.row = oldRow;
            tmp1.col = oldCol;
            return;
        } else console.log("Valid move!");
        this.checkEnPassant(row, col);
        this.currentPiece.row = row;
        this.currentPiece.col = col;
        let oldPiece = this.currentPiece;
        this.setSquareInactive();
        this.addPosToHistory(row, col);
        this.checkGameOver();
        this.userMove();
        this.updateCastleMove(oldPiece);
        this.promotion(row, col, oldPiece);
    }
    attack(target) {
        let tmp1 = this.currentPiece;
        let tmp2 = this.board[target.row][target.col];
        let oldRow = this.currentPiece.row;
        let oldCol = this.currentPiece.col;

        this.board[target.row][target.col] = this.currentPiece;
        this.board[this.currentPiece.row][this.currentPiece.col] = null;
        tmp1.row = target.row;
        tmp1.col = target.col;

        if(this.checkCheckmate(this.currentPlayer) === "check"){
            // alert("Invalid move!");
            console.log("Invalid move, still in check!");
            this.currentPiece = tmp1;
            this.board[oldRow][oldCol] = tmp1;
            this.board[target.row][target.col] = tmp2;
            tmp1.row = oldRow;
            tmp1.col = oldCol;
            return;
        } else console.log("Valid move!");
        this.currentPiece.row = target.row;
        this.currentPiece.col = target.col;
        let oldPiece = this.currentPiece;
        this.setSquareInactive();
        this.addPosToHistory(target.row, target.col);
        this.checkGameOver();
        this.userMove();
        this.promotion(target.row, target.col, oldPiece);
    }

    attackEnPassant(row, col) {
        let dir = this.currentPiece.color === "w" ? -1 : 1;
        let tmp1 = this.currentPiece;
        let tmp2 = this.board[row][col];
        let oldRow = this.currentPiece.row;
        let oldCol = this.currentPiece.col;

        this.board[row][col] = this.currentPiece;
        this.board[this.currentPiece.row][this.currentPiece.col] = null;
        this.board[this.enPassant.pos.row - dir][this.enPassant.pos.col] = null;
        if(this.checkCheckmate(this.currentPlayer) === "check"){
            // alert("Invalid move!");
            console.log("Invalid move, still in check!");
            this.currentPiece = tmp1;
            this.board[oldRow][oldCol] = tmp1;
            this.board[target.row][target.col] = tmp2;

            return;
        } else console.log("Valid move!");
        this.currentPiece.row = row;
        this.currentPiece.col = col;
        this.setSquareInactive();
        this.addPosToHistory(row, col);
        this.checkGameOver();
        this.userMove();
    }

    checkEnPassant(row, col) {
        if(this.currentPiece.name === "pawn" && Math.abs(this.currentPiece.row - row) === 2) {
            let dir = this.currentPiece.color === "w" ? -1 : 1;
            this.enPassant.color = this.currentPiece.color;
            this.enPassant.pos = {row: row - dir, col: col};
            this.enPassant.move = this.moveHistory.length;
        }
    }
    
    enPassantAttack(row, col) {
        if(this.currentPiece.name === "pawn" && this.enPassant.color !== null && this.enPassant.move === this.moveHistory.length - 1) {
            if(this.enPassant.pos.row === row && this.enPassant.pos.col === col && this.enPassant.color !== this.currentPiece.color) {
                return true;
            }else return false
        }else return false;
    }
    checkCastling(row, col) {
        if(this.currentPiece === null) return false;
        let dir = col - this.currentPiece.col;
        dir = dir > 0 ? 1 : -1;
        if(this.currentPiece.name === "king" && this.currentPiece.moved === false) {
            if(this.board[row][col].name === "rook" && this.board[row][col].moved === false) {
                if(this.board[this.currentPiece.row][this.currentPiece.col + dir*2] === null && this.board[this.currentPiece.row][this.currentPiece.col + dir] === null) {
                    let rookDist = Math.abs(this.currentPiece.col - col) - 1;
                    this.move(row, this.currentPiece.col + dir*2);
                    this.currentPiece = this.board[row][col];
                    this.move(row, col - dir*rookDist);
                    return true;
                }else {
                    // alert("Invalid move!")
                    console.log("Invalid move!");
                };
            }
        }else if(this.currentPiece.name === "rook" && this.currentPiece.moved === false){
            // console.log("rook move")
        }else {
            return false;
        }
    }
    promotion(row, col, piece) {
        let finalRow = piece.color === "w" ? 0 : 7;
        if(piece.name === "pawn" && row === finalRow) {
            this.board[row][col] = new Queen(piece.color, {row: row, col: col});
            // this.drawBoard();
        }
    }
}