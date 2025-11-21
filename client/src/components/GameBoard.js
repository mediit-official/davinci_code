import React, { useState } from 'react';
import Card from './Card';
import GuessModal from './GuessModal';
import ChatBox from './ChatBox';
import './GameBoard.css';

function GameBoard({ gameState, onGuess, onLeave }) {
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [showGuessModal, setShowGuessModal] = useState(false);

  const handleCardClick = (index) => {
    if (gameState.isYourTurn && !gameState.opponentCards[index].isRevealed) {
      setSelectedCardIndex(index);
      setShowGuessModal(true);
    }
  };

  const handleGuess = (number, color) => {
    onGuess(selectedCardIndex, number, color);
    setShowGuessModal(false);
    setSelectedCardIndex(null);
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Davinci Code Game</h2>
        <button className="leave-btn" onClick={onLeave}>나가기</button>
      </div>

      <div className="game-status">
        {gameState.status === 'finished' ? (
          <h3>게임 종료! 승자: {gameState.winner?.name}</h3>
        ) : (
          <h3>{gameState.isYourTurn ? '당신의 턴입니다!' : '상대방의 턴입니다...'}</h3>
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
          }}
        />
      )}
    </div>
  );
}

export default GameBoard;
