class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.cards = [];
    this.isAlive = true;
    this.lastDrawnCardIndex = null; // 이번 턴에 마지막으로 뽑은 카드의 인덱스
  }

  addCard(card, isInitial = false) {
    this.cards.push(card);
    const oldLength = this.cards.length;
    this.sortCards();
    // 새로 추가된 카드의 정렬 후 인덱스 찾기
    if (!isInitial) {
      // 게임 중 뽑은 카드만 lastDrawnCardIndex 업데이트
      for (let i = 0; i < this.cards.length; i++) {
        if (this.cards[i] === card) {
          this.lastDrawnCardIndex = i;
          break;
        }
      }
    }
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
      return this.cards[index];
    }
    return null;
  }

  revealLastDrawnCard() {
    if (this.lastDrawnCardIndex !== null) {
      const card = this.revealCard(this.lastDrawnCardIndex);
      this.lastDrawnCardIndex = null;
      return card;
    }
    return null;
  }

  clearLastDrawnCard() {
    this.lastDrawnCardIndex = null;
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
