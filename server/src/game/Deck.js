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

  isEmpty() {
    return this.cards.length === 0;
  }

  remainingCards() {
    return this.cards.length;
  }
}

module.exports = Deck;
