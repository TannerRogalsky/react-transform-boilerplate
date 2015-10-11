const getCanvasRelativeCoords = function(coords) {
  coords.x -= this.offsetLeft;
  coords.y -= this.offsetTop;
};

export default class Game {
  constructor(canvas) {
    this.context = canvas.getContext('2d');

    canvas.onmousedown = this.onTouchStart.bind(this);
    canvas.onmouseup = this.onTouchEnd.bind(this);
    canvas.onmousemove = this.onTouchMove.bind(this);

    canvas.ontouchstart = this.onTouchStart.bind(this);
    canvas.ontouchend = this.onTouchEnd.bind(this);
    canvas.ontouchmove = this.onTouchMove.bind(this);

    this.getCanvasRelativeCoords = getCanvasRelativeCoords.bind(canvas);

    this.width = canvas.width;
    this.height = canvas.height;

    this.lines = [];
    this.currentLine = null;
    this.touchPosition = {x: 0, y: 0};
  }

  update(dt) {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.currentLine) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.moveTo(this.currentLine.x, this.currentLine.y);
      ctx.lineTo(this.touchPosition.x, this.touchPosition.y);
      ctx.stroke();
    }

    ctx.beginPath();
    for (const line of this.lines) {
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
    }
    ctx.stroke();
  }

  onTouchMove(e) {
    this.touchPosition.x = e.clientX;
    this.touchPosition.y = e.clientY;
    this.getCanvasRelativeCoords(this.touchPosition);
  }

  onTouchStart(e) {
    console.log('down', e);
    this.currentLine = {x: e.clientX, y: e.clientY};
    this.getCanvasRelativeCoords(this.currentLine);
  }

  onTouchEnd(e) {
    console.log('up', e);
    this.lines.push({
      x1: this.currentLine.x, y1: this.currentLine.y,
      x2: this.touchPosition.x, y2: this.touchPosition.y
    });
    this.currentLine = null;
  }
}
