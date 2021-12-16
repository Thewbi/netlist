class Circle {

  constructor(id, color, x, y, radius) {
    this.id = id;
    this.color = color;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.radians = Math.PI * 2;
  }

  render(ctx) {
    ctx.arc(this.x, this.y, this.radius, 0, this.radians, false);
    //ctx.fillStyle = '#2793ef';
    //ctx.fillStyle = '#000000';
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  isHit(x, y) {
    return (x >= this.x && x <= this.x + this.width) && (y >= this.y && y <= this.y + this.height);
  }

  onHit(x, y) {
    console.log(this.id, " was hit!");
  }

}