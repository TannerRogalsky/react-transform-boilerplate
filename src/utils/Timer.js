let performance, requestAnimationFrame, cancelAnimationFrame;

function Timer() {
  this.microTime = performance.now();
  this.deltaTime = 0;
  this.deltaTimeLimit = 0.25;
  this.animationFrameID = null;
}

Timer.prototype.cancelFrame = function() {
  cancelAnimationFrame(this.animationFrameID);
};

Timer.prototype.nextFrame = function(callback) {
  this.animationFrameID = requestAnimationFrame(callback);
};

Timer.prototype.getDelta = function() {
  return this.deltaTime;
};

Timer.prototype.getFPS = function() {
  if (this.deltaTime === 0) {
    return 0;
  } else {
    return 1 / this.deltaTime;
  }
};

Timer.prototype.getTime = function() {
  return this.microTime;
};

Timer.prototype.step = function() {
  const dt = (performance.now() - this.microTime) / 1000;
  this.deltaTime = Math.max(0, Math.min(this.deltaTimeLimit, dt));
  return this.microTime += dt * 1000;
};

performance = window.performance || Date;

performance.now = performance.now ||
                  performance.msNow ||
                  performance.mozNow ||
                  performance.webkitNow ||
                  Date.now;

let lastTime = 0;
requestAnimationFrame = window.requestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        function(callback) {
                          const currTime = performance.now();
                          const timeToCall = Math.max(0, 16 - (currTime - lastTime));

                          const delay = function() {
                            return callback(currTime + timeToCall);
                          };

                          lastTime = currTime + timeToCall;
                          return setTimeout(delay, timeToCall);
                        };

cancelAnimationFrame =  window.cancelAnimationFrame ||
                        window.cancelRequestAnimationFrame ||
                        window.msCancelAnimationFrame ||
                        window.msCancelRequestAnimationFrame ||
                        window.mozCancelAnimationFrame ||
                        window.mozCancelRequestAnimationFrame ||
                        window.webkitCancelAnimationFrame ||
                        window.webkitCancelRequestAnimationFrame ||
                        window.oCancelAnimationFrame ||
                        window.oCancelRequestAnimationFrame ||
                        window.clearTimeout;

export default Timer;
