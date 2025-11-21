import React, { useState, useEffect } from 'react';
import Lobby from './pages/Lobby';
import GameBoard from './components/GameBoard';
import DesignTest from './pages/DesignTest';
import Toast from './components/Toast';
import socketService from './services/socket';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [isInGame, setIsInGame] = useState(false);
  const [toast, setToast] = useState(null);

  // URL 경로 체크
  const isDesignTest = window.location.pathname === '/design-test';

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (isInGame) {
      // 게임 업데이트 리스너
      socketService.onGameUpdated((data) => {
        setGameState(data.gameState);

        // 마지막 액션 알림
        if (data.lastAction) {
          const message = data.lastAction.result === 'correct' ? '정답!' : '오답!';
          console.log(message, data.lastAction);
        }
      });

      // 게임 종료 리스너
      socketService.onGameEnded((data) => {
        showToast(`게임 종료! 승자: ${data.winner.name}`, 'info');
      });

      // 플레이어 퇴장 리스너
      socketService.onPlayerLeft(() => {
        showToast('상대방이 나갔습니다. 로비로 돌아갑니다.', 'error');
        setTimeout(() => handleLeaveGame(), 2000);
      });

      return () => {
        socketService.off('game-updated');
        socketService.off('game-ended');
        socketService.off('player-left');
      };
    }
  }, [isInGame]);

  const handleGameStart = (initialGameState) => {
    setGameState(initialGameState);
    setIsInGame(true);
  };

  const handleGuess = (cardIndex, number) => {
    socketService.guessCard(cardIndex, number, (response) => {
      if (!response.success) {
        showToast('오류: ' + response.error, 'error');
      } else {
        if (response.correct) {
          showToast('정답입니다!', 'success');
        } else {
          showToast('틀렸습니다!', 'error');
        }
      }
    });
  };

  const handleLeaveGame = () => {
    socketService.leaveRoom(() => {
      setIsInGame(false);
      setGameState(null);
      // 페이지 새로고침으로 로비로 돌아가기
      window.location.reload();
    });
  };

  return (
    <div className="App">
      {isDesignTest ? (
        <DesignTest />
      ) : isInGame && gameState ? (
        <GameBoard
          gameState={gameState}
          onGuess={handleGuess}
          onLeave={handleLeaveGame}
        />
      ) : (
        <Lobby onGameStart={handleGameStart} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
