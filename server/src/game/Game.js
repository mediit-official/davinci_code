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
    this.status = 'selecting'; // selecting, playing, finished
    this.winner = null;
    this.createdAt = Date.now();
    this.playerSelections = {}; // 플레이어별 카드 선택 저장
    this.guessHistory = []; // 추측 기록 저장
    this.lastGuess = null; // 마지막 추측 정보
  }

  // 플레이어가 원하는 색상별 카드 개수 선택
  selectInitialCards(playerId, blackCount, whiteCount) {
    if (blackCount + whiteCount !== 4) {
      return { success: false, error: 'Total must be 4 cards' };
    }

    if (blackCount < 0 || whiteCount < 0) {
      return { success: false, error: 'Invalid card counts' };
    }

    this.playerSelections[playerId] = { blackCount, whiteCount };

    // 두 플레이어가 모두 선택했는지 확인
    if (Object.keys(this.playerSelections).length === 2) {
      this.initializeGame();
    }

    return { success: true };
  }

  initializeGame() {
    // 각 플레이어에게 선택한 색상별로 카드 분배
    this.players.forEach(player => {
      const selection = this.playerSelections[player.id];
      if (!selection) {
        // 기본값: 랜덤
        selection = { blackCount: 2, whiteCount: 2 };
      }

      // 검은색 카드 분배
      for (let i = 0; i < selection.blackCount; i++) {
        const card = this.deck.drawByColor('black');
        if (card) player.addCard(card, true); // true = 초기 카드
      }

      // 흰색 카드 분배
      for (let i = 0; i < selection.whiteCount; i++) {
        const card = this.deck.drawByColor('white');
        if (card) player.addCard(card, true); // true = 초기 카드
      }
    });

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

  // 덱에서 카드 뽑기 (턴 시작 시) - 색상 선택 가능
  drawCard(playerId, color = null) {
    if (!this.isPlayerTurn(playerId)) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.deck.isEmpty()) {
      return { success: false, error: 'No cards left in deck' };
    }

    const currentPlayer = this.getCurrentPlayer();
    let card;

    // 색상이 지정되면 해당 색상 카드 뽑기
    if (color === 'black' || color === 'white') {
      card = this.deck.drawByColor(color);
      if (!card) {
        return { success: false, error: `No ${color} cards left` };
      }
    } else {
      // 색상 미지정시 랜덤
      card = this.deck.draw();
    }

    currentPlayer.addCard(card);

    return {
      success: true,
      card: card.toJSON()
    };
  }

  // 상대방 카드 맞추기 (숫자만)
  guessCard(playerId, cardIndex, guessedNumber) {
    if (!this.isPlayerTurn(playerId)) {
      return { success: false, error: 'Not your turn' };
    }

    const currentPlayer = this.getCurrentPlayer();
    const opponent = this.getOpponentPlayer();

    if (!opponent.hasCard(cardIndex)) {
      return { success: false, error: 'Invalid card index' };
    }

    const targetCard = opponent.getCard(cardIndex);

    if (targetCard.isRevealed) {
      return { success: false, error: 'Card already revealed' };
    }

    // 추측 정보 저장
    const guessInfo = {
      guesserId: playerId,
      guesserName: currentPlayer.name,
      targetId: opponent.id,
      targetName: opponent.name,
      cardIndex: cardIndex,
      guessedNumber: guessedNumber,
      actualCard: targetCard.toJSON(),
      timestamp: Date.now()
    };

    // 숫자만 비교 (색상은 이미 보임)
    const isCorrect = targetCard.number === guessedNumber;
    guessInfo.isCorrect = isCorrect;

    // 추측 기록에 추가
    this.guessHistory.push(guessInfo);
    this.lastGuess = guessInfo;

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
          winner: this.winner,
          guessInfo: guessInfo
        };
      }

      return {
        success: true,
        correct: true,
        additionalTurn: true,
        revealedCard: targetCard.toJSON(),
        guessInfo: guessInfo
      };
    } else {
      // 틀림: 방금 뽑은 카드를 공개
      const revealedCard = currentPlayer.revealLastDrawnCard();

      // 자신의 모든 카드가 공개되었는지 확인
      if (currentPlayer.checkAllRevealed()) {
        this.endGame(opponent);
        return {
          success: true,
          correct: false,
          gameEnded: true,
          winner: this.winner,
          revealedCard: revealedCard ? revealedCard.toJSON() : null,
          guessInfo: guessInfo
        };
      }

      // 턴 넘김
      this.switchTurn();

      return {
        success: true,
        correct: false,
        revealedCard: revealedCard ? revealedCard.toJSON() : null,
        guessInfo: guessInfo
      };
    }
  }

  // 턴 패스 (맞춘 후 더 이상 맞추지 않고 넘기기)
  passTurn(playerId) {
    if (!this.isPlayerTurn(playerId)) {
      return { success: false, error: 'Not your turn' };
    }

    const currentPlayer = this.getCurrentPlayer();
    currentPlayer.clearLastDrawnCard(); // 뽑은 카드 정보 초기화
    this.switchTurn();

    return { success: true };
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
      winner: this.winner,
      lastGuess: this.lastGuess, // 마지막 추측 정보
      deckBlackRemaining: this.deck.remainingBlackCards(),
      deckWhiteRemaining: this.deck.remainingWhiteCards(),
      opponentNewCardIndex: opponent ? opponent.lastDrawnCardIndex : null // 상대방이 방금 뽑은 카드 위치
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
