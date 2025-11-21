import React, { useState } from 'react';
import './GuessModal.css';

function GuessModal({ onGuess, onCancel }) {
  const [number, setNumber] = useState(0);
  const [color, setColor] = useState('white');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuess(parseInt(number), color);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>카드 맞추기</h3>
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
            />
          </div>

          <div className="form-group">
            <label>색상:</label>
            <div className="color-options">
              <label className="color-option">
                <input
                  type="radio"
                  name="color"
                  value="white"
                  checked={color === 'white'}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="color-label white">흰색</span>
              </label>
              <label className="color-option">
                <input
                  type="radio"
                  name="color"
                  value="black"
                  checked={color === 'black'}
                  onChange={(e) => setColor(e.target.value)}
                />
                <span className="color-label black">검은색</span>
              </label>
            </div>
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
