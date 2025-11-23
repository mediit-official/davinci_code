import React, { useState, useEffect } from 'react';
import './Card.css';

function Card({ card, index, isOwn, onGuess, isTargeted, guessedNumber, hideNumber = false }) {
  const [wasRevealed, setWasRevealed] = useState(card.isRevealed);

  // 카드가 공개될 때 애니메이션
  useEffect(() => {
    if (card.isRevealed && !wasRevealed) {
      setWasRevealed(true);
    }
  }, [card.isRevealed, wasRevealed]);

  const handleClick = () => {
    if (!isOwn && !card.isRevealed && onGuess) {
      onGuess(index);
    }
  };

  const justRevealed = card.isRevealed && !wasRevealed;

  return (
    <div
      className={`card ${card.color} ${card.isRevealed ? 'revealed' : 'hidden'} ${justRevealed ? 'just-revealed' : ''} ${!isOwn && !card.isRevealed ? 'clickable' : ''} ${isOwn && card.isRevealed ? 'own-revealed' : ''} ${isTargeted ? 'targeted' : ''}`}
      onClick={handleClick}
    >
      {isTargeted && guessedNumber !== null && (
        <>
          <div className="guess-speech-bubble">
            {guessedNumber}
          </div>
          <div className="guess-pointer">👇</div>
        </>
      )}

      {card.isRevealed ? (
        <div className="card-content">
          {hideNumber ? <div className="card-back">?</div> : <div className="card-number">{card.number}</div>}
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
