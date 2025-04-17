class Piece {
    constructor(name, color, pos) {
        this.name = name;
        this.color = color;
        this.col = pos.col;
        this.row = pos.row;
        this.isAlive = true;
        this.img = this.getImage();
    }
    getImage() {
        return `/assets/pieces/${this.name}-${this.color}.svg`;
    }
}

export class Pawn extends Piece {
    constructor(color, pos) {
        super("pawn", color, pos);
    }
    canMove(board, newPos){
        const direction = this.color === "w" ? 1 : -1;
        const startRow = this.color === "w" ? 6 : 1;
        const distance = Math.abs(this.row - newPos.row);
        if(this.row - newPos.row )
        if(this.row !== startRow && distance === 2) return false; // Max 2 steg
            if((this.row - newPos.row === direction) || (this.row - newPos.row === direction*2)) {
            if(this.col !== newPos.col) { // diagonal
                return false; 
            }
            return true; 
        } return false;
    }
    canAttack(board, newPos) {
        const directionRow = this.color === "w" ? 1 : -1;
        const directionCol = Math.abs(this.col - newPos.col);
        if(this.row - newPos.row === directionRow && directionCol === 1) {
            return true; 
        }
        return false; 
    }
}

export class Rook extends Piece {
    constructor(color, pos) {
        super("rook", color, pos);
        this.moved = false; // For castling
    }
    canMove(board, newPos) {
        if(this.row === newPos.row) {
            if(this.col < newPos.col) {
                for(let i = this.col + 1; i <= newPos.col; i++) {
                    if(board[this.row][i] !== null) return false;
                }
                return true; 
            }else if(this.col > newPos.col) {
                for(let i = this.col - 1; i >= newPos.col; i--) {
                    if(board[this.row][i] !== null) return false; 
                }
                return true; 
            }
        }
        if(this.col === newPos.col) {
            if(this.row < newPos.row) {
                for(let i = this.row + 1; i <= newPos.row; i++) {
                    if(board[i][this.col] !== null) return false; 
                }
                return true; 
            }else if(this.row > newPos.row) {
                for(let i = this.row - 1; i >= newPos.row; i--) {
                    if(board[i][this.col] !== null) return false; 
                }
                return true; 
            }
        }
        return false; 
    }
    canAttack(board, newPos) {
        if(this.row === newPos.row || this.col === newPos.col) {
            const directionRow = Math.sign(newPos.row - this.row);
            const directionCol = Math.sign(newPos.col - this.col);
            console.log(directionRow, directionCol);
            if(Math.abs(this.row - newPos.row) === 1 || Math.abs(this.col - newPos.col) === 1) {
                return true;
            }
            if(directionRow !== 0) {
                console.log("row", newPos.row + directionRow);
                if(this.canMove(board, {row: newPos.row - directionRow, col: newPos.col})) return true;
                else return false;
            }else if(directionCol !== 0) {
                console.log("col", newPos.col - directionCol);
                if(this.canMove(board, {row: newPos.row, col: newPos.col - directionCol})) return true;
                else return false;
            }
        }
        return false; 
    }
}

export class Knight extends Piece {
    constructor(color, pos) {
        super("knight", color, pos);
    }
    canMove(board, newPos) {
        const rowDiff = Math.abs(this.row - newPos.row);
        const colDiff = Math.abs(this.col - newPos.col);
        if((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            return true; 
        }
        return false; 
    }
    canAttack(board, newPos) {
        return this.canMove(board, newPos); 
    }
}

export class Bishop extends Piece {
    constructor(color, pos) {
        super("bishop", color, pos);
    }
    canMove(board, newPos) {
        const rowDiff = Math.abs(this.row - newPos.row);
        const colDiff = Math.abs(this.col - newPos.col);
        if(rowDiff === colDiff) {
            const directionRow = Math.sign(newPos.row - this.row);
            const directionCol = Math.sign(newPos.col - this.col);
            for(let i = 1; i < rowDiff; i++) {
                if(board[this.row + i*directionRow][this.col + i*directionCol] !== null) return false;
            }
            return true; 
        }
        return false; 
    }
    canAttack(board, newPos) {
        return this.canMove(board, newPos); 
    }
}

export class Queen extends Piece {
    constructor(color, pos) {
        super("queen", color, pos);
    }
    canMove(board, newPos) {
        const rowDiff = Math.abs(this.row - newPos.row);
        const colDiff = Math.abs(this.col - newPos.col);
        if(rowDiff === colDiff || this.row === newPos.row || this.col === newPos.col) {
            const directionRow = Math.sign(newPos.row - this.row);
            const directionCol = Math.sign(newPos.col - this.col);
            if(rowDiff === colDiff) {
                for(let i = 1; i < rowDiff; i++) {
                    if(board[this.row + i*directionRow][this.col + i*directionCol] !== null) return false;
                }
            }else if(this.row === newPos.row) {
                for(let i = this.col + directionCol; i !== newPos.col; i += directionCol) {
                    if(board[this.row][i] !== null) return false;
                }
            }else if(this.col === newPos.col) {
                for(let i = this.row + directionRow; i !== newPos.row; i += directionRow) {
                    if(board[i][this.col] !== null) return false;
                }
            }
            return true; 
        }
        return false; 
    }
    canAttack(board, newPos) {
        return this.canMove(board, newPos); 
    }
}

export class King extends Piece {
    constructor(color, pos) {
        super("king", color, pos);
        this.moved = false; // For castling
    }
    canMove(board, newPos) {
        const rowDiff = Math.abs(this.row - newPos.row);
        const colDiff = Math.abs(this.col - newPos.col);
        if(rowDiff <= 1 && colDiff <= 1) {
            for(let i = 0; i < 8; i++) {
                for(let j = 0; j < 8; j++) {
                    if(board[i][j] !== null && board[i][j].color !== this.color) {
                        if(board[i][j].canAttack(board, newPos)) {
                            // alert("You cannot move your king there!");
                            return  false
                        };
                    }
                }
            }
            return true; 
        }
        return false; 
    }
    canAttack(board, newPos) {
        return this.canMove(board, newPos); 
    }
}
