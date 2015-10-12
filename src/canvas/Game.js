import getDebugDraw from '../utils/getDebugDraw';

const e_shapeBit = 0x0001;
const e_jointBit = 0x0002;

const SCALE = 32;

const getCanvasRelativeCoords = function(coords, camera) {
  coords.x -= this.offsetLeft + camera.x;
  coords.y -= this.offsetTop + camera.y;
  coords.y *= -1;
  coords.x /= SCALE;
  coords.y /= SCALE;
};

const createBall = function(world, x, y, r) {
  const ballShape = new Box2D.b2CircleShape();
  ballShape.set_m_radius(r);
  const ballBodyDef = new Box2D.b2BodyDef();
  ballBodyDef.set_type(Box2D.b2_dynamicBody);
  const ballBody = world.CreateBody(ballBodyDef);
  ballBody.CreateFixture(ballShape, 1.0);
  ballBody.SetTransform(new Box2D.b2Vec2(x, y), 0.0);
  return ballBody
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
    this.camera = {x: 0, y: canvas.height};

    this.lines = [];
    this.currentLine = null;
    this.touchPosition = {x: 0, y: 0};

    const gravity = new Box2D.b2Vec2(0.0, -10.0);
    const world = new Box2D.b2World(gravity, true);

    this.linesBody = world.CreateBody(new Box2D.b2BodyDef());
    this.ballBody = createBall(world, 5, canvas.height / SCALE, 0.5);

    const debugDraw = getDebugDraw(this.context);
    debugDraw.SetFlags(e_shapeBit | e_jointBit);
    world.SetDebugDraw(debugDraw);

    this.world = world;
  }

  update(dt) {
    this.world.Step(dt, 3, 2);

    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(-this.camera.x, -this.camera.y);
    ctx.scale(SCALE, SCALE);
    ctx.lineWidth /= SCALE;

    this.world.DrawDebugData();

    if (this.currentLine) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.moveTo(this.currentLine.x, this.currentLine.y);
      ctx.lineTo(this.touchPosition.x, this.touchPosition.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  onTouchMove(e) {
    this.touchPosition.x = e.clientX;
    this.touchPosition.y = e.clientY;
    this.getCanvasRelativeCoords(this.touchPosition, this.camera);
  }

  onTouchStart(e) {
    // console.log('down', e);
    this.currentLine = {x: e.clientX, y: e.clientY};
    this.getCanvasRelativeCoords(this.currentLine, this.camera);
  }

  onTouchEnd(e) {
    // console.log('up', e);
    this.touchPosition.x = e.clientX;
    this.touchPosition.y = e.clientY;
    this.getCanvasRelativeCoords(this.touchPosition, this.camera);

    const line = {
      x1: this.currentLine.x, y1: this.currentLine.y,
      x2: this.touchPosition.x, y2: this.touchPosition.y
    };
    this.lines.push(line);

    const lineShape = new Box2D.b2EdgeShape();
    lineShape.Set(new Box2D.b2Vec2(line.x1, line.y1), new Box2D.b2Vec2(line.x2, line.y2));
    this.linesBody.CreateFixture(lineShape, 0.0);

    this.currentLine = null;
  }
}
