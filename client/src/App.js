import React, { useState, useEffect } from 'react';
import Lobby from './pages/Lobby';
import GameBoard from './components/GameBoard';
import socketService from './services/socket';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [isInGame, setIsInGame] = useState(false);

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
        alert(`게임 종료! 승자: ${data.winner.name}`);
      });

      // 플레이어 퇴장 리스너
      socketService.onPlayerLeft(() => {
        alert('상대방이 나갔습니다. 로비로 돌아갑니다.');
        handleLeaveGame();
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
        alert('오류: ' + response.error);
      } else {
        if (response.correct) {
          console.log('정답!');
        } else {
          console.log('오답!');
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
      {isInGame && gameState ? (
        <GameBoard
          gameState={gameState}
          onGuess={handleGuess}
          onLeave={handleLeaveGame}
        />
      ) : (
        <Lobby onGameStart={handleGameStart} />
      )}
    </div>
  );
}

export default App;
