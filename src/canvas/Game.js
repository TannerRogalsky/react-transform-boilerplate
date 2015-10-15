import getDebugDraw from '../utils/getDebugDraw';

const e_shapeBit = 0x0001;
const e_jointBit = 0x0002;

const SCALE = 32;
const STARTING_POSITION = {x: 5, y: 10};

const getCanvasRelativeCoords = function(coords, camera) {
  coords.x -= this.offsetLeft + camera.x * -1 * SCALE;
  coords.y -= this.offsetTop + camera.y * SCALE;
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
  return ballBody;
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

    canvas.oncontextmenu = function() {return false;};

    this.getCanvasRelativeCoords = getCanvasRelativeCoords.bind(canvas);

    this.width = canvas.width / SCALE;
    this.height = canvas.height / SCALE;
    this.camera = {x: -2, y: 20};

    this.playing = false;
    this.lines = [];
    this.touchDownPosition = null;
    this.touchPosition = {x: 0, y: 0};

    const gravity = new Box2D.b2Vec2(0.0, -10.0);
    const world = new Box2D.b2World(gravity, true);

    const listener = new Box2D.JSContactListener();
    listener.BeginContact = (contactPtr) => {
        var contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact);
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        console.log('A', fixtureA);
        console.log('B', fixtureB);
    };
    listener.EndContact = function() {};
    listener.PreSolve = function() {};
    listener.PostSolve = function() {};

    world.SetContactListener(listener);

    this.linesBody = world.CreateBody(new Box2D.b2BodyDef());
    this.ballBody = createBall(world, STARTING_POSITION.x, STARTING_POSITION.y, 0.5);

    const debugDraw = getDebugDraw(this.context);
    debugDraw.SetFlags(e_shapeBit | e_jointBit);
    world.SetDebugDraw(debugDraw);

    this.world = world;
  }

  startPlaying() {
    this.playing = true;
  }

  startEditing() {
    this.playing = false;

    const {x, y} = STARTING_POSITION;
    this.ballBody.SetLinearVelocity(new Box2D.b2Vec2(0, 0));
    this.ballBody.SetAngularVelocity(0);
    this.ballBody.SetTransform(new Box2D.b2Vec2(x, y), 0.0);

    this.camera.x = x - this.width / 2;
    this.camera.y = y + this.height / 2;
  }

  update(dt) {
    if (this.playing) {
      this.world.Step(dt, 3, 2);
      const ballPos = this.ballBody.GetPosition();
      this.camera.x = ballPos.get_x() - this.width / 2;
      this.camera.y = ballPos.get_y() + this.height / 2;
    }
    this.render();
  }

  render() {
    const ctx = this.context;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.width * SCALE, this.height * SCALE);
    ctx.save();
    ctx.scale(1, -1);
    ctx.scale(SCALE, SCALE);
    ctx.translate(-this.camera.x, -this.camera.y);
    ctx.lineWidth /= SCALE;

    this.world.DrawDebugData();

    if (this.touchDownPosition && this.touchDownPosition.button === 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.moveTo(this.touchDownPosition.x, this.touchDownPosition.y);
      ctx.lineTo(this.touchPosition.x, this.touchPosition.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  onTouchMove(e) {
    this.touchPosition.x = e.clientX;
    this.touchPosition.y = e.clientY;
    this.getCanvasRelativeCoords(this.touchPosition, this.camera);

    if (e.button === 2) {
      this.camera.x -= e.movementX / SCALE;
      this.camera.y += e.movementY / SCALE;
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    this.touchDownPosition = {x: e.clientX, y: e.clientY, button: e.button, cx: this.camera.x, cy: this.camera.y};
    this.getCanvasRelativeCoords(this.touchDownPosition, this.camera);
  }

  onTouchEnd(e) {
    e.preventDefault();
    this.touchPosition.x = e.clientX;
    this.touchPosition.y = e.clientY;
    this.getCanvasRelativeCoords(this.touchPosition, this.camera);

    if (e.button === 0) {
      const line = {
        x1: this.touchDownPosition.x, y1: this.touchDownPosition.y,
        x2: this.touchPosition.x, y2: this.touchPosition.y
      };
      this.lines.push(line);

      const lineShape = new Box2D.b2EdgeShape();
      lineShape.Set(new Box2D.b2Vec2(line.x1, line.y1), new Box2D.b2Vec2(line.x2, line.y2));
      this.linesBody.CreateFixture(lineShape, 0.0);
    }

    this.touchDownPosition = null;
  }
}
