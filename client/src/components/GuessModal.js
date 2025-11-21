import React, { useState } from 'react';
import './GuessModal.css';

function GuessModal({ onGuess, onCancel, cardColor }) {
  const [selectedNumber, setSelectedNumber] = useState(null);

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const handleNumberSelect = (num) => {
    setSelectedNumber(num);
  };

  const handleSubmit = () => {
    if (selectedNumber !== null) {
      onGuess(selectedNumber);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>숫자를 선택하세요</h3>
        <p className="card-color-info">
          <span className={`color-badge ${cardColor}`}>{cardColor === 'black' ? '●' : '○'}</span>
        </p>

        <div className="number-grid">
          {numbers.map((num) => (
            <button
              key={num}
              type="button"
              className={`number-btn ${selectedNumber === num ? 'selected' : ''}`}
              onClick={() => handleNumberSelect(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-submit"
            onClick={handleSubmit}
            disabled={selectedNumber === null}
          >
            확인
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default GuessModal;
