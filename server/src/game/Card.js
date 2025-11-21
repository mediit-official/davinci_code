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
    // 상대방에게는 색상은 항상 보이고, 숫자만 공개되었을 때 보임
    return {
      number: this.isRevealed ? this.number : null,
      color: this.color, // 색상은 항상 보임
      isRevealed: this.isRevealed
    };
  }
}

module.exports = Card;
