class Rectangle {

  constructor(id, x, y, height, width) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
  }

  render(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isHit(x, y) {
    return (x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height);
  }

  onHit(x, y) {
    console.log(this.id, " was hit!");
  }

}