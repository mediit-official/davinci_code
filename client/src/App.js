import React, { useState, useEffect, useRef } from 'react';
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
  const [opponentRevealedCard, setOpponentRevealedCard] = useState(null);
  const [revealingCardIndex, setRevealingCardIndex] = useState(null); // 공개 애니메이션 진행 중인 카드 인덱스

  // URL 경로 체크
  const isDesignTest = window.location.pathname === '/design-test';

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (isInGame) {
      // 게임 업데이트 리스너
      const handleGameUpdate = (data) => {
        console.log('=== Game Update ===');
        console.log('Full data:', data);
        console.log('lastAction:', data.lastAction);
        console.log('guessInfo:', data.lastAction?.guessInfo);
        console.log('🆕 opponentNewCardIndex:', data.gameState?.opponentNewCardIndex);

        // 상대방의 액션 알림 (내가 한 액션은 handleGuess에서 처리)
        if (data.lastAction && data.lastAction.guessInfo) {
          const myId = socketService.socket?.id;
          const guesserId = data.lastAction.guessInfo.guesserId;

          console.log('My ID:', myId);
          console.log('Guesser ID:', guesserId);
          console.log('Is opponent?', guesserId !== myId);

          // 상대방이 추측한 경우만 알림 표시
          if (guesserId !== myId) {
            console.log('Showing opponent guess result!');

            if (data.lastAction.result === 'incorrect' && data.lastAction.guessInfo.revealedCard) {
              // 상대방이 틀린 경우: 해당 카드만 숨기고 나머지는 업데이트
              console.log('🔴 상대방 틀림 - 해당 카드 인덱스 저장');
              const cardIndex = data.lastAction.guessInfo.cardIndex;
              setRevealingCardIndex(cardIndex);

              // gameState 업데이트 (하지만 GameBoard에서 해당 카드는 숨김 처리)
              setGameState(data.gameState);

              // 2초 후 "틀렸습니다" 토스트
              setTimeout(() => {
                showToast('상대방이 틀렸습니다!', 'error');

                // 토스트 3.5초 후 카드 공개 애니메이션 시작
                setTimeout(() => {
                  console.log('🎬 카드 공개 애니메이션 시작');
                  setOpponentRevealedCard(data.lastAction.guessInfo.revealedCard);
                }, 3500);
              }, 2000);
            } else {
              // 상대방이 맞춘 경우: 즉시 업데이트
              setGameState(data.gameState);

              setTimeout(() => {
                if (data.lastAction.result === 'correct') {
                  showToast('상대방이 맞췄습니다!', 'success');
                }
              }, 2000);
            }
          } else {
            // 내가 추측한 경우: 즉시 업데이트
            setGameState(data.gameState);
          }
        } else {
          // lastAction이 없는 일반 업데이트: 즉시 반영
          setGameState(data.gameState);
        }
      };

      socketService.onGameUpdated(handleGameUpdate);

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
        // 2초 후 결과 팝업 표시 (말풍선이 뜨는 동안)
        setTimeout(() => {
          if (response.correct) {
            showToast('정답입니다!', 'success');
          } else {
            showToast('틀렸습니다!', 'error');
          }
        }, 2000);
      }
    });
  };

  const handleOpponentCardRevealed = () => {
    // 카드 공개 애니메이션이 끝난 후 숨김 상태 해제
    console.log('✅ 애니메이션 완료 - revealingCardIndex 해제');
    setOpponentRevealedCard(null);
    setRevealingCardIndex(null);
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
          opponentRevealedCard={opponentRevealedCard}
          onOpponentCardRevealed={handleOpponentCardRevealed}
          revealingCardIndex={revealingCardIndex}
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
