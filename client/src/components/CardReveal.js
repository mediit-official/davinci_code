import React, { useEffect, useState } from 'react';
import './CardReveal.css';

function CardReveal({ card, onComplete, type = 'new-card' }) {
  const [stage, setStage] = useState('appearing'); // appearing -> showing -> moving
  const [showCardNumber, setShowCardNumber] = useState(type === 'new-card'); // 새 카드는 바로 표시, 공개는 나중에

  useEffect(() => {
    if (type === 'new-card') {
      // 새 카드 뽑기 애니메이션
      // 1. 등장 (0.3s)
      const timer1 = setTimeout(() => {
        setStage('showing');
      }, 300);

      // 2. 보여주기 (1s)
      const timer2 = setTimeout(() => {
        setStage('moving');
      }, 1300);

      // 3. 이동 후 완료 (0.5s)
      const timer3 = setTimeout(() => {
        onComplete();
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // 상대방 카드 공개 애니메이션
      // 1. 등장 (0.5s)
      const timer1 = setTimeout(() => {
        setStage('showing');
      }, 500);

      // 2. 카드 번호 표시 (0.3s 후)
      const timer2 = setTimeout(() => {
        setShowCardNumber(true);
      }, 800);

      // 3. 보여주기 (1.5s)
      const timer3 = setTimeout(() => {
        setStage('disappearing');
      }, 2300);

      // 4. 사라지기 (0.5s)
      const timer4 = setTimeout(() => {
        onComplete();
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [onComplete, type]);

  const isOpponentReveal = type === 'opponent-reveal';
  const revealText = isOpponentReveal ? '상대방 카드 공개!' : '새 카드!';

  return (
    <div className="card-reveal-overlay">
      <div className={`card-reveal ${stage} ${isOpponentReveal ? 'opponent-reveal' : ''}`}>
        <div className={`revealed-card ${card.color}`}>
          {showCardNumber && <div className="card-number">{card.number}</div>}
        </div>
        <p className="reveal-text">{revealText}</p>
      </div>
    </div>
  );
}

export default CardReveal;
