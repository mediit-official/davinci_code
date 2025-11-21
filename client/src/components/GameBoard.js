import React, { useState } from 'react';
import Card from './Card';
import GuessModal from './GuessModal';
import ChatBox from './ChatBox';
import socketService from '../services/socket';
import './GameBoard.css';

function GameBoard({ gameState, onGuess, onLeave }) {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [selectedCardColor, setSelectedCardColor] = useState(null);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  const handleDrawCard = () => {
    socketService.socket.emit('draw-card', {}, (response) => {
      if (response.success) {
        setHasDrawnCard(true);
        setCanContinue(false);
      } else {
        alert('카드 뽑기 실패: ' + response.error);
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
      } else {
        alert('턴 패스 실패: ' + response.error);
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
        <h2>다빈치 코드</h2>
        <button className="leave-btn" onClick={onLeave}>나가기</button>
      </div>

      <div className="game-status">
        {gameState.status === 'finished' ? (
          <h3>게임 종료! 승자: {gameState.winner?.name}</h3>
        ) : (
          <div className="turn-info">
            <h3>{gameState.isYourTurn ? '당신의 턴입니다!' : '상대방의 턴입니다...'}</h3>
            {gameState.isYourTurn && !hasDrawnCard && (
              <button className="draw-card-btn" onClick={handleDrawCard}>
                카드 뽑기 (남은 카드: {gameState.deckRemaining})
              </button>
            )}
            {gameState.isYourTurn && hasDrawnCard && !canContinue && (
              <p className="instruction">상대방의 카드를 선택해서 숫자를 맞춰보세요!</p>
            )}
            {gameState.isYourTurn && canContinue && (
              <div className="continue-options">
                <p className="instruction">맞췄습니다! 계속 하시겠습니까?</p>
                <button className="continue-btn" onClick={() => setCanContinue(false)}>
                  계속하기
                </button>
                <button className="pass-btn" onClick={handlePassTurn}>
                  턴 넘기기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="game-content">
        <div className="game-area">
          <div className="player-section opponent-section">
            <div className="player-info">
              <h4>{gameState.opponentInfo?.name}</h4>
              <p>카드: {gameState.opponentCards?.length}장</p>
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

          <div className="player-section your-section">
            <div className="player-info">
              <h4>{gameState.yourInfo?.name} (당신)</h4>
              <p>카드: {gameState.yourCards?.length}장</p>
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

        <ChatBox roomId={gameState.roomId} />
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
    </div>
  );
}

export default GameBoard;
