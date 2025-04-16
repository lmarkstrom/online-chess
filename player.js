export class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.castled = false; 
        this.kingMoved = false;
        this.rook1Moved = false; 
        this.rook2Moved = false;
    }
}