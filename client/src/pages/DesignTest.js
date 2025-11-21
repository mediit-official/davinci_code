import React, { useState } from 'react';
import Card from '../components/Card';
import GuessModal from '../components/GuessModal';
import '../components/GameBoard.css';

function DesignTest() {
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [selectedCardColor, setSelectedCardColor] = useState('white');

  // 테스트용 더미 데이터
  const dummyOpponentCards = [
    { number: null, color: 'white', isRevealed: false },
    { number: null, color: 'black', isRevealed: false },
    { number: 5, color: 'white', isRevealed: true },
    { number: null, color: 'black', isRevealed: false },
    { number: 11, color: 'black', isRevealed: true },
  ];

  const dummyYourCards = [
    { number: 2, color: 'white', isRevealed: true },
    { number: 4, color: 'black', isRevealed: true },
    { number: 7, color: 'white', isRevealed: true },
    { number: 9, color: 'black', isRevealed: true },
  ];

  const handleCardClick = (index) => {
    setSelectedCardColor(dummyOpponentCards[index].color);
    setShowGuessModal(true);
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <button className="leave-btn" onClick={() => window.location.href = '/'}>
          나가기
        </button>
      </div>

      <div className="game-content">
        {/* 상대방 덱 - 위 */}
        <div className="player-section opponent-section">
          <div className="player-info">
            <h4>상대방</h4>
          </div>
          <div className="cards-container">
            {dummyOpponentCards.map((card, index) => (
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
          <div className="turn-indicator">
            <h3>당신의 턴</h3>
          </div>
          <button className="draw-card-btn">
            카드 뽑기
            <span className="deck-count">(12)</span>
          </button>
        </div>

        {/* 내 덱 - 아래 */}
        <div className="player-section your-section">
          <div className="player-info">
            <h4>나</h4>
          </div>
          <div className="cards-container">
            {dummyYourCards.map((card, index) => (
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
          onGuess={(number) => {
            alert(`선택한 숫자: ${number}`);
            setShowGuessModal(false);
          }}
          onCancel={() => setShowGuessModal(false)}
          cardColor={selectedCardColor}
        />
      )}
    </div>
  );
}

export default DesignTest;
