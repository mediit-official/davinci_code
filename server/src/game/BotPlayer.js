// 간단한 AI 봇 플레이어
class BotPlayer {
  constructor(game, botPlayerId) {
    this.game = game;
    this.botPlayerId = botPlayerId;
  }

  // 봇의 턴을 자동으로 실행
  async playTurn() {
    return new Promise((resolve) => {
      // 1.5초 대기 후 행동 (사람처럼 보이게)
      setTimeout(async () => {
        try {
          // 1. 카드 뽑기
          const color = Math.random() > 0.5 ? 'black' : 'white';
          const drawResult = this.game.drawCard(this.botPlayerId, color);

          if (!drawResult.success) {
            // 덱이 비었거나 특정 색상이 없으면 다른 색상 시도
            const alternateColor = color === 'black' ? 'white' : 'black';
            const retryResult = this.game.drawCard(this.botPlayerId, alternateColor);
            if (!retryResult.success) {
              resolve({ success: false, reason: 'no_cards' });
              return;
            }
          }

          // 2초 대기 후 추측
          setTimeout(() => {
            // 상대방(사람)의 카드 중 공개되지 않은 카드 찾기
            const opponent = this.game.getOpponentPlayer();
            const humanCards = opponent.cards;
            const unrevealedCards = humanCards
              .map((card, index) => ({ card, index }))
              .filter(({ card }) => !card.isRevealed);

            if (unrevealedCards.length === 0) {
              // 더 이상 맞출 카드가 없으면 턴 패스
              this.game.passTurn(this.botPlayerId);
              resolve({ success: true, action: 'pass' });
              return;
            }

            // 랜덤으로 카드 선택
            const targetCard = unrevealedCards[Math.floor(Math.random() * unrevealedCards.length)];

            // 간단한 추측 전략: 0-11 범위에서 랜덤 (나중에 더 똑똑하게 개선 가능)
            const guessedNumber = Math.floor(Math.random() * 12);

            // 추측 실행 후 1.5초 딜레이를 두고 결과 처리
            const guessResult = this.game.guessCard(this.botPlayerId, targetCard.index, guessedNumber);

            // 결과를 즉시 반환하되, 다음 행동은 딜레이
            setTimeout(() => {
              if (guessResult.success && guessResult.correct && guessResult.additionalTurn) {
                // 맞춤! 추가 턴이 있으면 재귀적으로 다시 실행
                setTimeout(() => {
                  this.playTurn().then(resolve);
                }, 1500);
              } else {
                // 틀렸거나 게임 종료
                resolve({
                  success: true,
                  action: 'guess',
                  result: guessResult,
                  gameEnded: guessResult.gameEnded,
                  guessInfo: guessResult.guessInfo
                });
              }
            }, 2000); // 2초 딜레이 (말풍선 보여주는 시간)
          }, 2000);

        } catch (error) {
          console.error('Bot error:', error);
          resolve({ success: false, error: error.message });
        }
      }, 1500);
    });
  }

  // 초기 카드 선택 (게임 시작 시)
  selectInitialCards() {
    // 랜덤으로 흑백 비율 선택
    const blackCount = Math.floor(Math.random() * 5); // 0-4
    const whiteCount = 4 - blackCount;

    return this.game.selectInitialCards(this.botPlayerId, blackCount, whiteCount);
  }
}

module.exports = BotPlayer;
