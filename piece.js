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
        if(this.row !== startRow && distance === 2) return false; // Max 2 steg
        if((this.row - newPos.row < direction) || (this.row - newPos.row > direction*2)) return false; // Rör sig inte i rätt riktning
        if(this.col !== newPos.col) { // diagonal
            return false; 
        }
        return true; 
    }
    canAttack(board, newPos) {
        const directionRow = this.color === "w" ? 1 : -1;
        const distance = Math.abs(this.row - newPos.row);
        if(Math.abs(this.row - newPos.row) === 1 && distance === 1) {
            return true; 
        }
        return false; 
    }
}

