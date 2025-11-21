import React from 'react';
import './Card.css';

function Card({ card, index, isOwn, onGuess }) {
  const handleClick = () => {
    if (!isOwn && !card.isRevealed && onGuess) {
      onGuess(index);
    }
  };

  return (
    <div
      className={`card ${card.color} ${card.isRevealed ? 'revealed' : 'hidden'} ${!isOwn && !card.isRevealed ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      {card.isRevealed ? (
        <div className="card-content">
          <div className="card-number">{card.number}</div>
        </div>
      ) : isOwn ? (
        <div className="card-content">
          <div className="card-number">{card.number}</div>
        </div>
      ) : (
        <div className="card-back">?</div>
      )}
    </div>
  );
}

export default Card;
