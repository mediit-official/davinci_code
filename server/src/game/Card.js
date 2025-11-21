class Card {
  constructor(number, color) {
    this.number = number; // 0-11
    this.color = color; // 'white' or 'black'
    this.isRevealed = false;
  }

  reveal() {
    this.isRevealed = true;
  }

  toJSON() {
    return {
      number: this.number,
      color: this.color,
      isRevealed: this.isRevealed
    };
  }

  toPublicJSON() {
    return {
      number: this.isRevealed ? this.number : null,
      color: this.isRevealed ? this.color : null,
      isRevealed: this.isRevealed
    };
  }
}

module.exports = Card;
