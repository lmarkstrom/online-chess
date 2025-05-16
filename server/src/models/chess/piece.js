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
    return `/pieces/${this.name}-${this.color}.svg`;
  }
}

export default Piece;
