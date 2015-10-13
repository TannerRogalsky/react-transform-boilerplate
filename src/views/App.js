import React from 'react';
import Game from '../canvas/Game';
import Runner from '../utils/Runner';

const runGameLoop = function(game) {
  return Runner.run(game.update.bind(game));
}

export default React.createClass({
  getInitialState() {
    return {
      playing: false
    };
  },

  componentDidMount() {
    const canvas = this.refs.canvas;
    this.game = new Game(canvas);
    this.taskId = runGameLoop(this.game);
  },

  handleClick() {
    if (this.game.playing) {
      this.game.startEditing();
    } else {
      this.game.startPlaying();
    }
    this.setState({
      playing: !this.state.playing
    });
  },

  render() {
    const buttonText = this.state.playing ? 'Edit' : 'Play';
    return (
      <div>
        <button onClick={this.handleClick}>{buttonText}</button>
        <canvas ref='canvas' width={600} height={600} />
      </div>
    )
  }
});
