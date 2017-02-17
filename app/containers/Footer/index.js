import React, { Component } from 'react';
import h from '../../utils/helpers';
import './Footer.scss';

const baseEmojis = ['🍍', '🕑', '🎏', '🔥', '🦄', '🍑', '🔑', '🙌', '❤️'];

export default class Footer extends Component {
  state = { emojis: h.shuffle(baseEmojis), i: 0 }

  randomizeEmoji() {
    const { emojis, i } = this.state;
    this.setState({ i: i < emojis.length - 1 ? i + 1 : 0 });
  }

  render() {
    const { emojis, i } = this.state;
    const btn = <button className="footer__emoji" onClick={() => this.randomizeEmoji()}>{emojis[i]}</button>
    return (
      <footer className="footer">
        <span className="footer__made-with">Made with {btn} on 🌏 by <a href="https://github.com/JasonEtco">Jason Etcovitch</a>
        </span>
      </footer>
    );
  }
}
