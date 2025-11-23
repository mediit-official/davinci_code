const Card = require('./Card');

class Deck {
  constructor() {
    this.cards = [];
    this.initializeDeck();
  }

  initializeDeck() {
    // 흰색 카드: 0-11 (총 12장)
    for (let i = 0; i <= 11; i++) {
      this.cards.push(new Card(i, 'white'));
    }

    // 검은색 카드: 0-11 (총 12장)
    for (let i = 0; i <= 11; i++) {
      this.cards.push(new Card(i, 'black'));
    }

    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    return this.cards.pop();
  }

  // 특정 색상의 카드 뽑기
  drawByColor(color) {
    const index = this.cards.findIndex(card => card.color === color);
    if (index !== -1) {
      return this.cards.splice(index, 1)[0];
    }
    return null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  remainingCards() {
    return this.cards.length;
  }

  remainingBlackCards() {
    return this.cards.filter(card => card.color === 'black').length;
  }

  remainingWhiteCards() {
    return this.cards.filter(card => card.color === 'white').length;
  }
}

module.exports = Deck;
