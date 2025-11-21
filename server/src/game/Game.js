const Deck = require('./Deck');
const Player = require('./Player');

class Game {
  constructor(roomId, player1, player2) {
    this.roomId = roomId;
    this.deck = new Deck();
    this.players = [
      new Player(player1.id, player1.name),
      new Player(player2.id, player2.name)
    ];
    this.currentPlayerIndex = 0;
    this.status = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.createdAt = Date.now();

    this.initializeGame();
  }

  initializeGame() {
    // 각 플레이어에게 4장씩 카드 분배
    for (let i = 0; i < 4; i++) {
      this.players[0].addCard(this.deck.draw());
      this.players[1].addCard(this.deck.draw());
    }

    this.status = 'playing';
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getOpponentPlayer() {
    return this.players[1 - this.currentPlayerIndex];
  }

  getPlayerById(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  isPlayerTurn(playerId) {
    return this.getCurrentPlayer().id === playerId;
  }

  // 상대방 카드 맞추기
  guessCard(playerId, cardIndex, guessedNumber, guessedColor) {
    if (!this.isPlayerTurn(playerId)) {
      return { success: false, error: 'Not your turn' };
    }

    const opponent = this.getOpponentPlayer();

    if (!opponent.hasCard(cardIndex)) {
      return { success: false, error: 'Invalid card index' };
    }

    const targetCard = opponent.getCard(cardIndex);

    if (targetCard.isRevealed) {
      return { success: false, error: 'Card already revealed' };
    }

    const isCorrect = targetCard.number === guessedNumber && targetCard.color === guessedColor;

    if (isCorrect) {
      // 맞춤: 카드 공개, 추가 턴
      opponent.revealCard(cardIndex);

      // 상대방이 모든 카드를 공개했는지 확인
      if (opponent.checkAllRevealed()) {
        this.endGame(this.getCurrentPlayer());
        return {
          success: true,
          correct: true,
          additionalTurn: false,
          gameEnded: true,
          winner: this.winner
        };
      }

      return {
        success: true,
        correct: true,
        additionalTurn: true,
        revealedCard: targetCard.toJSON()
      };
    } else {
      // 틀림: 자신의 카드 하나 공개 (가장 작은 숫자의 미공개 카드)
      const currentPlayer = this.getCurrentPlayer();
      let revealed = false;

      for (let i = 0; i < currentPlayer.cards.length; i++) {
        if (!currentPlayer.cards[i].isRevealed) {
          currentPlayer.revealCard(i);
          revealed = true;
          break;
        }
      }

      // 자신의 모든 카드가 공개되었는지 확인
      if (currentPlayer.checkAllRevealed()) {
        this.endGame(opponent);
        return {
          success: true,
          correct: false,
          gameEnded: true,
          winner: this.winner
        };
      }

      // 턴 넘김
      this.switchTurn();

      return {
        success: true,
        correct: false,
        ownCardRevealed: revealed
      };
    }
  }

  switchTurn() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  }

  endGame(winner) {
    this.status = 'finished';
    this.winner = winner.toJSON();
  }

  getGameState(playerId) {
    const player = this.getPlayerById(playerId);
    const opponent = this.players.find(p => p.id !== playerId);

    return {
      roomId: this.roomId,
      status: this.status,
      currentTurn: this.getCurrentPlayer().id,
      isYourTurn: this.isPlayerTurn(playerId),
      yourCards: player ? player.getCardsForOwner() : [],
      opponentCards: opponent ? opponent.getCardsForOpponent() : [],
      yourInfo: player ? player.toJSON() : null,
      opponentInfo: opponent ? opponent.toJSON() : null,
      deckRemaining: this.deck.remainingCards(),
      winner: this.winner
    };
  }

  toJSON() {
    return {
      roomId: this.roomId,
      status: this.status,
      players: this.players.map(p => p.toJSON()),
      currentTurn: this.getCurrentPlayer().id,
      winner: this.winner,
      createdAt: this.createdAt
    };
  }
}

module.exports = Game;
