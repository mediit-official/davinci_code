class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.cards = [];
    this.isAlive = true;
  }

  addCard(card) {
    this.cards.push(card);
    this.sortCards();
  }

  sortCards() {
    // 먼저 숫자로 정렬, 같은 숫자면 검은색이 먼저
    this.cards.sort((a, b) => {
      if (a.number !== b.number) {
        return a.number - b.number;
      }
      return a.color === 'black' ? -1 : 1;
    });
  }

  revealCard(index) {
    if (index >= 0 && index < this.cards.length) {
      this.cards[index].reveal();
      return true;
    }
    return false;
  }

  hasCard(index) {
    return index >= 0 && index < this.cards.length;
  }

  getCard(index) {
    return this.cards[index];
  }

  checkAllRevealed() {
    return this.cards.every(card => card.isRevealed);
  }

  getCardsForOwner() {
    return this.cards.map(card => card.toJSON());
  }

  getCardsForOpponent() {
    return this.cards.map(card => card.toPublicJSON());
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      isAlive: this.isAlive,
      cardCount: this.cards.length
    };
  }
}

module.exports = Player;
