import React from 'react';
import './DeckColorModal.css';

function DeckColorModal({ onSelectColor, blackRemaining, whiteRemaining }) {
  return (
    <div className="deck-modal-overlay">
      <div className="deck-modal">
        <h3>덱에서 카드 뽑기</h3>
        <p>어떤 색상의 카드를 뽑으시겠습니까?</p>

        <div className="deck-cards">
          <button
            className="deck-card-btn black-deck"
            onClick={() => onSelectColor('black')}
            disabled={blackRemaining === 0}
          >
            <div className="deck-card-display">
              <div className="deck-card-back black"></div>
              <div className="deck-count">{blackRemaining}장</div>
            </div>
            <div className="deck-label">검은색</div>
          </button>

          <button
            className="deck-card-btn white-deck"
            onClick={() => onSelectColor('white')}
            disabled={whiteRemaining === 0}
          >
            <div className="deck-card-display">
              <div className="deck-card-back white"></div>
              <div className="deck-count">{whiteRemaining}장</div>
            </div>
            <div className="deck-label">흰색</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeckColorModal;
