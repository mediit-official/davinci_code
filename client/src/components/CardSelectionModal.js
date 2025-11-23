import React, { useState } from 'react';
import './CardSelectionModal.css';

function CardSelectionModal({ onSelect }) {
  const [blackCount, setBlackCount] = useState(2);
  const whiteCount = 4 - blackCount;

  const handleBlackChange = (delta) => {
    const newCount = Math.max(0, Math.min(4, blackCount + delta));
    setBlackCount(newCount);
  };

  const handleSubmit = () => {
    onSelect(blackCount, whiteCount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card-selection-modal">
        <h3>초기 카드 선택</h3>
        <p className="selection-description">
          검은색과 흰색 카드를 선택하세요 (총 4장)
        </p>

        <div className="card-selectors">
          <div className="card-selector black-selector">
            <div className="selector-label">
              <span className="color-circle black">●</span>
              <span>검은색</span>
            </div>
            <div className="counter">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleBlackChange(-1)}
                disabled={blackCount === 0}
              >
                −
              </button>
              <span className="count-display">{blackCount}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleBlackChange(1)}
                disabled={blackCount === 4}
              >
                +
              </button>
            </div>
          </div>

          <div className="card-selector white-selector">
            <div className="selector-label">
              <span className="color-circle white">○</span>
              <span>흰색</span>
            </div>
            <div className="counter">
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleBlackChange(1)}
                disabled={whiteCount === 0}
              >
                −
              </button>
              <span className="count-display">{whiteCount}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={() => handleBlackChange(-1)}
                disabled={whiteCount === 4}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="total-display">
          총 {blackCount + whiteCount}장
        </div>

        <button
          type="button"
          className="btn-confirm"
          onClick={handleSubmit}
        >
          확인
        </button>
      </div>
    </div>
  );
}

export default CardSelectionModal;
