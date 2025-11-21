import React, { useState } from 'react';
import './GuessModal.css';

function GuessModal({ onGuess, onCancel, cardColor }) {
  const [number, setNumber] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuess(parseInt(number));
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>카드 맞추기</h3>
        <p className="card-color-info">
          선택한 카드: <span className={`color-badge ${cardColor}`}>{cardColor === 'black' ? '검은색' : '흰색'}</span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>숫자 (0-11):</label>
            <input
              type="number"
              min="0"
              max="11"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-submit">확인</button>
            <button type="button" className="btn-cancel" onClick={onCancel}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GuessModal;
