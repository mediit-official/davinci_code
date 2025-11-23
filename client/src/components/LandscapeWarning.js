import React, { useState, useEffect } from 'react';
import './LandscapeWarning.css';

function LandscapeWarning() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isPort = window.innerHeight > window.innerWidth;
      setIsPortrait(isPort);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="landscape-warning">
      <div className="landscape-warning-content">
        <div className="rotate-icon">📱 ↻</div>
        <h2>가로 모드로 전환해주세요</h2>
        <p>최적의 게임 경험을 위해<br/>기기를 가로로 회전시켜주세요</p>
      </div>
    </div>
  );
}

export default LandscapeWarning;
