import React from 'react';
import Game from '../canvas/Game';
import Runner from '../utils/Runner';

const runGameLoop = function(game) {
  return Runner.run(game.update.bind(game));
}

export default React.createClass({
  componentDidMount() {
    const canvas = this.refs.canvas;
    this.game = new Game(canvas);
    this.taskId = runGameLoop(this.game);
  },

  render() {
    return (
      <canvas ref='canvas' width={1280} height={720} />
    )
  }
});
