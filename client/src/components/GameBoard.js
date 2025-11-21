import React, { useState } from 'react';
import Card from './Card';
import GuessModal from './GuessModal';
import Toast from './Toast';
import socketService from '../services/socket';
import './GameBoard.css';

function GameBoard({ gameState, onGuess, onLeave }) {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedCardColor, setSelectedCardColor] = useState(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleDrawCard = () => {
    socketService.socket.emit('draw-card', {}, (response) => {
      if (response.success) {
        setHasDrawnCard(true);
        setCanContinue(false);
        showToast('카드를 뽑았습니다!', 'success');
      } else {
        showToast('카드 뽑기 실패: ' + response.error, 'error');
      }
    });
  };

  const handleCardClick = (index) => {
    if (gameState.isYourTurn && hasDrawnCard && !gameState.opponentCards[index].isRevealed) {
      setSelectedCardIndex(index);
      setSelectedCardColor(gameState.opponentCards[index].color);
      setShowGuessModal(true);
    }
  };

  const handleGuess = (number) => {
    onGuess(selectedCardIndex, number);
    setShowGuessModal(false);
    setCanContinue(true);
    setSelectedCardIndex(null);
    setSelectedCardColor(null);
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

  // 게임 상태가 변경될 때 턴 초기화
  React.useEffect(() => {
    if (!gameState.isYourTurn) {
      setHasDrawnCard(false);
      setCanContinue(false);
    }
  }, [gameState.isYourTurn]);

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
            {gameState.opponentCards?.map((card, index) => (
              <Card
                key={index}
                card={card}
                index={index}
                isOwn={false}
                onGuess={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* 게임 상태 및 카드 뽑기 - 중앙 */}
        <div className="game-center">
          {gameState.status === 'finished' ? (
            <div className="game-status">
              <h3>게임 종료! 승자: {gameState.winner?.name}</h3>
            </div>
          ) : (
            <>
              <div className="turn-indicator">
                <h3>{gameState.isYourTurn ? '당신의 턴' : '상대방의 턴'}</h3>
              </div>
              {gameState.isYourTurn && !hasDrawnCard && (
                <button className="draw-card-btn" onClick={handleDrawCard}>
                  카드 뽑기
                  <span className="deck-count">({gameState.deckRemaining})</span>
                </button>
              )}
              {gameState.isYourTurn && hasDrawnCard && !canContinue && (
                <p className="instruction">상대방 카드를 선택하세요</p>
              )}
              {gameState.isYourTurn && canContinue && (
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
                key={index}
                card={card}
                index={index}
                isOwn={true}
              />
            ))}
          </div>
        </div>
      </div>

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
