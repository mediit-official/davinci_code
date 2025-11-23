import React, { useState } from 'react';
import Card from './Card';
import GuessModal from './GuessModal';
import CardSelectionModal from './CardSelectionModal';
import CardReveal from './CardReveal';
import DeckColorModal from './DeckColorModal';
import Toast from './Toast';
import socketService from '../services/socket';
import './GameBoard.css';

function GameBoard({ gameState, onGuess, onLeave, opponentRevealedCard, onOpponentCardRevealed, revealingCardIndex }) {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedCardColor, setSelectedCardColor] = useState(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [showCardSelection, setShowCardSelection] = useState(gameState.status === 'selecting');
  const [showDeckColorModal, setShowDeckColorModal] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [toast, setToast] = useState(null);
  const [revealingCard, setRevealingCard] = useState(null);
  const [targetedCardIndex, setTargetedCardIndex] = useState(null);
  const [lastGuessInfo, setLastGuessInfo] = useState(null);
  const [myGuessCardIndex, setMyGuessCardIndex] = useState(null);
  const [myGuessNumber, setMyGuessNumber] = useState(null);
  const [opponentGuessing, setOpponentGuessing] = useState(false);
  const [processedGuessTimestamp, setProcessedGuessTimestamp] = useState(null);
  const [showTurnIndicator, setShowTurnIndicator] = useState(true);
  const [opponentThinking, setOpponentThinking] = useState(false);
  const [previousTurn, setPreviousTurn] = useState(null);
  const [lastCorrectGuesserId, setLastCorrectGuesserId] = useState(null);
  const [revealingOpponentCard, setRevealingOpponentCard] = useState(null);
  const [displayedNewCardIndex, setDisplayedNewCardIndex] = useState(null); // NEW 표시를 위한 별도 state

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleDrawCardClick = () => {
    // 카드 뽑기 시작 - 이전 효과 모두 초기화
    setTargetedCardIndex(null);
    setLastGuessInfo(null);
    setOpponentGuessing(false);
    setMyGuessCardIndex(null);
    setMyGuessNumber(null);

    // 덱 색상 선택 모달 표시
    setShowDeckColorModal(true);
  };

  const handleColorSelect = (color) => {
    setShowDeckColorModal(false);
    // 카드 뽑기 전에 이전 타겟 상태 초기화
    setTargetedCardIndex(null);
    setLastGuessInfo(null);

    socketService.socket.emit('draw-card', { color }, (response) => {
      if (response.success) {
        // 뽑은 카드를 중앙에 표시
        setRevealingCard(response.card);
        setHasDrawnCard(true);
        setCanContinue(false);
      } else {
        showToast('카드 뽑기 실패: ' + response.error, 'error');
      }
    });
  };

  const handleRevealComplete = () => {
    setRevealingCard(null);
  };

  const handleCardClick = (index) => {
    if (gameState.isYourTurn && hasDrawnCard && !gameState.opponentCards[index].isRevealed) {
      setSelectedCardIndex(index);
      setSelectedCardColor(gameState.opponentCards[index].color);
      setShowGuessModal(true);
    }
  };

  const handleGuess = (number) => {
    // 내가 추측한 카드 정보 저장 (말풍선 표시용)
    const targetIndex = selectedCardIndex;

    setShowGuessModal(false);
    setSelectedCardIndex(null);
    setSelectedCardColor(null);

    // 말풍선 표시
    setMyGuessCardIndex(targetIndex);
    setMyGuessNumber(number);

    // 서버에 추측 전송
    onGuess(targetIndex, number);

    // 2초 후에 말풍선 제거
    setTimeout(() => {
      setMyGuessCardIndex(null);
      setMyGuessNumber(null);
    }, 2000);
  };

  const handlePassTurn = () => {
    socketService.socket.emit('pass-turn', {}, (response) => {
      if (response.success) {
        setHasDrawnCard(false);
        setCanContinue(false);
        showToast('턴을 넘겼습니다', 'info');
      } else {
        showToast('턴 패스 실패: ' + response.error, 'error');
      }
    });
  };

  const handleCardSelection = (blackCount, whiteCount) => {
    socketService.socket.emit('select-initial-cards', { blackCount, whiteCount }, (response) => {
      if (response.success) {
        setShowCardSelection(false);
        showToast('카드 선택 완료! 상대방을 기다리는 중...', 'success');
      } else {
        showToast('카드 선택 실패: ' + response.error, 'error');
      }
    });
  };

  // 게임 상태가 변경될 때 턴 초기화 및 상대방 행동 추적
  React.useEffect(() => {
    // 이전 턴과 현재 턴 비교
    const turnChanged = previousTurn !== null && previousTurn !== gameState.isYourTurn;
    setPreviousTurn(gameState.isYourTurn);

    if (!gameState.isYourTurn) {
      // 상대방 턴으로 넘어갈 때
      if (turnChanged) {
        // 턴 표시 숨기기 (5초 후 다시 표시)
        setShowTurnIndicator(false);
        setTimeout(() => {
          setShowTurnIndicator(true);
        }, 5000);
      }

      setHasDrawnCard(false);
      setCanContinue(false);
      setTargetedCardIndex(null);
      setLastGuessInfo(null);
      setOpponentGuessing(false);
      setOpponentThinking(false);
    } else {
      // 내 턴으로 넘어올 때
      if (turnChanged) {
        // 상대방이 틀렸거나 턴을 넘긴 경우
        if (opponentThinking) {
          // 상대방이 고민 중이었다면 턴을 넘긴 것
          setTimeout(() => {
            showToast('상대방이 턴을 넘겼습니다!', 'info');
          }, 5000);
        }

        // 턴 표시 숨기기 (5초 후 다시 표시)
        setShowTurnIndicator(false);
        setTimeout(() => {
          setShowTurnIndicator(true);
        }, 5000);
      }

      setTargetedCardIndex(null);
      setLastGuessInfo(null);
      setOpponentGuessing(false);
      setHasDrawnCard(false);
      setCanContinue(false);
      setMyGuessCardIndex(null);
      setMyGuessNumber(null);
      setOpponentThinking(false);
    }
  }, [gameState.isYourTurn]);

  // 게임 상태가 selecting에서 playing으로 변경되면 카드 선택 모달 닫기
  React.useEffect(() => {
    if (gameState.status === 'playing') {
      setShowCardSelection(false);
    }
  }, [gameState.status]);

  // 상대방 새 카드 표시 관리 (5초 동안 유지)
  React.useEffect(() => {
    if (gameState.opponentNewCardIndex !== null && gameState.opponentNewCardIndex !== undefined) {
      console.log('🆕 상대방 새 카드 감지:', gameState.opponentNewCardIndex);
      setDisplayedNewCardIndex(gameState.opponentNewCardIndex);

      // 5초 후 NEW 표시 제거
      const timer = setTimeout(() => {
        console.log('🆕 NEW 표시 제거');
        setDisplayedNewCardIndex(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameState.opponentNewCardIndex]);

  // 추측 정보가 업데이트되면 처리
  React.useEffect(() => {
    if (gameState.lastGuess && gameState.lastGuess.timestamp !== processedGuessTimestamp) {
      // 이미 처리한 추측은 다시 처리하지 않음
      setProcessedGuessTimestamp(gameState.lastGuess.timestamp);

      // 상대방이 고민 중이었는데 다시 추측한 경우 -> "계속합니다!" 알림
      if (opponentThinking &&
          gameState.lastGuess.guesserId !== socketService.socket.id &&
          gameState.lastGuess.guesserId === lastCorrectGuesserId) {
        showToast('상대방이 계속합니다!', 'info');
        setOpponentThinking(false);
      }

      // 내가 추측한 경우 && 정답인 경우 -> canContinue 활성화
      if (gameState.lastGuess.guesserId === socketService.socket.id && gameState.lastGuess.isCorrect) {
        setCanContinue(true);
      }

      // 정답을 맞춘 사람 추적
      if (gameState.lastGuess.isCorrect) {
        setLastCorrectGuesserId(gameState.lastGuess.guesserId);
      } else {
        setLastCorrectGuesserId(null);
      }

      // 상대방이 내 카드를 타겟한 경우 순차적 처리
      if (gameState.lastGuess.targetId === socketService.socket.id) {
        setOpponentGuessing(true);

        // 1단계: 카드 하이라이트
        setTargetedCardIndex(gameState.lastGuess.cardIndex);

        // 2단계: 1초 후 말풍선 표시
        setTimeout(() => {
          setLastGuessInfo(gameState.lastGuess);

          // 3단계: 추가 1초 후 하이라이트 제거
          setTimeout(() => {
            setTargetedCardIndex(null);
          }, 1000);

          // 4단계: 추가 1초 후 말풍선 제거 + 애니메이션 종료
          setTimeout(() => {
            setLastGuessInfo(null);
            setOpponentGuessing(false);

            // 5단계: 상대방이 맞춘 경우 "고민 중..." 표시
            if (gameState.lastGuess.isCorrect && !gameState.isYourTurn) {
              setTimeout(() => {
                setOpponentThinking(true);
                showToast('상대방이 고민 중입니다...', 'info');
              }, 3000);
            }
          }, 2000);
        }, 1000);
      } else if (gameState.lastGuess.guesserId === socketService.socket.id) {
        // 내가 추측한 경우는 즉시 표시
        setLastGuessInfo(gameState.lastGuess);
      }
    }
  }, [gameState.lastGuess, processedGuessTimestamp, gameState.isYourTurn, opponentThinking, lastCorrectGuesserId]);

  return (
    <div className="game-board">
      <div className="game-header">
        <button className="leave-btn" onClick={onLeave}>나가기</button>
      </div>

      <div className="game-content">
        {/* 상대방 덱 - 위 */}
        <div className="player-section opponent-section">
          <div className="player-info">
            <h4>{gameState.opponentInfo?.name}</h4>
          </div>
          <div className="cards-container">
            {gameState.opponentCards?.map((card, index) => {
              const isNewCard = displayedNewCardIndex === index;
              return (
                <div key={`opp-wrapper-${index}`} style={{ position: 'relative' }}>
                  {isNewCard && (
                    <div className="new-card-indicator">NEW!</div>
                  )}
                  <Card
                    key={`opp-${card.color}-${card.number}-${index}`}
                    card={card}
                    index={index}
                    isOwn={false}
                    onGuess={handleCardClick}
                    isTargeted={myGuessCardIndex === index}
                    guessedNumber={null}
                    hideNumber={revealingCardIndex === index}
                  />
                </div>
              );
            })}
          </div>
          {lastGuessInfo && lastGuessInfo.guesserId !== socketService.socket.id && (
            <div className="opponent-guess-bubble">
              {lastGuessInfo.guessedNumber}
            </div>
          )}
        </div>

        {/* 게임 상태 및 카드 뽑기 - 중앙 */}
        <div className="game-center">
          {gameState.status === 'finished' ? (
            <div className="game-status">
              <h3>게임 종료! 승자: {gameState.winner?.name}</h3>
            </div>
          ) : (
            <>
              {showTurnIndicator && (
                <div className="turn-indicator">
                  <h3>{gameState.isYourTurn ? '당신의 턴' : '상대방의 턴'}</h3>
                </div>
              )}
              {/* 1. 카드 뽑기 단계: 아직 카드를 뽑지 않았고, 상대방이 추측 중이 아닐 때 */}
              {gameState.isYourTurn && !hasDrawnCard && !opponentGuessing && (
                <button className="draw-card-btn" onClick={handleDrawCardClick}>
                  카드 뽑기
                  <span className="deck-count">
                    (검:{gameState.deckBlackRemaining || 0} / 흰:{gameState.deckWhiteRemaining || 0})
                  </span>
                </button>
              )}
              {/* 2. 추측 단계: 카드를 뽑았지만 아직 정답을 맞추지 못했을 때 */}
              {gameState.isYourTurn && hasDrawnCard && !canContinue && (
                <p className="instruction">상대방 카드를 선택하세요</p>
              )}
              {/* 3. 계속하기 단계: 정답을 맞춰서 추가 턴을 받았을 때 */}
              {gameState.isYourTurn && hasDrawnCard && canContinue && (
                <div className="continue-options">
                  <p className="success-text">정답!</p>
                  <button className="continue-btn" onClick={() => setCanContinue(false)}>
                    계속하기
                  </button>
                  <button className="pass-btn" onClick={handlePassTurn}>
                    턴 넘기기
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 내 덱 - 아래 */}
        <div className="player-section your-section">
          <div className="player-info">
            <h4>{gameState.yourInfo?.name} (나)</h4>
          </div>
          <div className="cards-container">
            {gameState.yourCards?.map((card, index) => (
              <Card
                key={`your-${card.color}-${card.number}-${index}`}
                card={card}
                index={index}
                isOwn={true}
                isTargeted={targetedCardIndex === index}
                guessedNumber={null}
              />
            ))}
          </div>
          {myGuessCardIndex !== null && myGuessNumber !== null && (
            <div className="opponent-guess-bubble">
              {myGuessNumber}
            </div>
          )}
        </div>
      </div>

      {revealingCard && (
        <CardReveal card={revealingCard} onComplete={handleRevealComplete} />
      )}

      {opponentRevealedCard && (
        <CardReveal card={opponentRevealedCard} onComplete={onOpponentCardRevealed} type="opponent-reveal" />
      )}

      {showCardSelection && (
        <CardSelectionModal onSelect={handleCardSelection} />
      )}

      {showDeckColorModal && (
        <DeckColorModal
          onSelectColor={handleColorSelect}
          blackRemaining={gameState.deckBlackRemaining || 0}
          whiteRemaining={gameState.deckWhiteRemaining || 0}
        />
      )}

      {showGuessModal && (
        <GuessModal
          onGuess={handleGuess}
          onCancel={() => {
            setShowGuessModal(false);
            setSelectedCardIndex(null);
            setSelectedCardColor(null);
          }}
          cardColor={selectedCardColor}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default GameBoard;
