const gameManager = require('../game/GameManager');

// 봇 턴 실행 헬퍼 함수
async function executeBotTurnIfNeeded(io, room, game) {
  if (!room.hasBot) return;

  const bot = gameManager.getBot(room.id);
  if (!bot) return;

  // 봇의 턴인지 확인
  if (gameManager.isBotTurn(room.id)) {
    // 봇 턴 실행
    const result = await bot.playTurn();

    // 게임 상태 업데이트 전송 (봇의 행동 정보 포함)
    room.players.forEach(player => {
      const updateData = {
        gameState: game.getGameState(player.id)
      };

      // 봇이 추측했으면 lastAction 추가
      if (result.action === 'guess' && result.guessInfo) {
        updateData.lastAction = {
          playerId: bot.botPlayerId,
          action: 'guess',
          result: result.result?.correct ? 'correct' : 'incorrect',
          guessInfo: {
            ...result.guessInfo,
            revealedCard: result.result?.revealedCard || null
          }
        };
      }

      io.to(player.id).emit('game-updated', updateData);
    });

    // 게임이 종료되었으면 알림
    if (result.gameEnded) {
      io.to(room.id).emit('game-ended', {
        winner: game.winner
      });
    } else if (result.success && !gameManager.isBotTurn(room.id)) {
      // 봇 턴이 끝나고 사람 턴이 되면 다시 업데이트
      room.players.forEach(player => {
        io.to(player.id).emit('game-updated', {
          gameState: game.getGameState(player.id)
        });
      });
    }
  }
}

function setupGameHandlers(io, socket) {
  // 방 생성
  socket.on('create-room', (playerData, callback) => {
    try {
      const player = {
        id: socket.id,
        name: playerData.name || 'Player'
      };

      const room = gameManager.createRoom(player);
      socket.join(room.id);

      console.log(`Room created: ${room.id} by ${player.name}`);

      callback({ success: true, room });

      // 모든 클라이언트에 방 목록 업데이트 전송
      io.emit('rooms-updated', gameManager.getAllRooms());
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 봇과 함께 방 생성 (싱글 플레이어)
  socket.on('create-room-with-bot', (playerData, callback) => {
    try {
      const player = {
        id: socket.id,
        name: playerData.name || 'Player'
      };

      const { room, game, bot } = gameManager.createRoomWithBot(player);
      socket.join(room.id);

      console.log(`Bot room created: ${room.id} by ${player.name}`);

      // 봇이 초기 카드 선택
      bot.selectInitialCards();

      callback({ success: true, room, gameState: game.getGameState(player.id) });

      // 게임이 selecting 상태면 시작 알림
      if (game.status === 'selecting') {
        io.to(socket.id).emit('game-started', {
          gameState: game.getGameState(player.id)
        });
      }
    } catch (error) {
      console.error('Error creating bot room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 방 참가
  socket.on('join-room', (data, callback) => {
    try {
      const { roomId, playerName } = data;
      const player = {
        id: socket.id,
        name: playerName || 'Player'
      };

      const result = gameManager.joinRoom(roomId, player);

      if (!result.success) {
        callback(result);
        return;
      }

      socket.join(roomId);
      console.log(`${player.name} joined room: ${roomId}`);

      // 방의 모든 플레이어에게 알림
      io.to(roomId).emit('player-joined', {
        player,
        room: result.room
      });

      callback({ success: true, room: result.room });

      // 게임이 시작되었으면 알림 (카드 선택 상태)
      if (result.room.status === 'selecting' || result.room.status === 'playing') {
        const game = gameManager.getGame(roomId);

        result.room.players.forEach(p => {
          io.to(p.id).emit('game-started', {
            gameState: game.getGameState(p.id)
          });
        });
      }

      // 방 목록 업데이트
      io.emit('rooms-updated', gameManager.getAllRooms());
    } catch (error) {
      console.error('Error joining room:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 초기 카드 색상 선택
  socket.on('select-initial-cards', async (data, callback) => {
    try {
      const { blackCount, whiteCount } = data;
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = game.selectInitialCards(socket.id, blackCount, whiteCount);

      if (!result.success) {
        callback(result);
        return;
      }

      callback(result);

      // 게임 상태 업데이트
      const room = gameManager.getRoomByPlayerId(socket.id);

      if (room && game.status === 'playing') {
        // 두 플레이어가 모두 선택 완료 -> 게임 시작
        room.players.forEach(player => {
          io.to(player.id).emit('game-updated', {
            gameState: game.getGameState(player.id)
          });
        });

        // 봇 턴이면 자동 실행
        await executeBotTurnIfNeeded(io, room, game);
      }
    } catch (error) {
      console.error('Error selecting initial cards:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 방 목록 요청
  socket.on('get-rooms', (callback) => {
    try {
      const rooms = gameManager.getAllRooms();
      callback({ success: true, rooms });
    } catch (error) {
      console.error('Error getting rooms:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 카드 뽑기 (색상 선택 가능)
  socket.on('draw-card', (data, callback) => {
    try {
      const { color } = data; // 'black', 'white', 또는 null
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = game.drawCard(socket.id, color);

      if (!result.success) {
        callback(result);
        return;
      }

      callback(result);

      // 모든 플레이어에게 게임 상태 업데이트 전송
      const room = gameManager.getRoomByPlayerId(socket.id);

      if (room) {
        room.players.forEach(player => {
          io.to(player.id).emit('game-updated', {
            gameState: game.getGameState(player.id)
          });
        });
      }
    } catch (error) {
      console.error('Error drawing card:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 카드 맞추기 (숫자만)
  socket.on('guess-card', async (data, callback) => {
    try {
      const { cardIndex, number } = data;
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = game.guessCard(socket.id, cardIndex, number);

      if (!result.success) {
        callback(result);
        return;
      }

      callback(result);

      // 모든 플레이어에게 게임 상태 업데이트 및 추측 정보 전송
      const room = gameManager.getRoomByPlayerId(socket.id);

      if (room) {
        room.players.forEach(player => {
          io.to(player.id).emit('game-updated', {
            gameState: game.getGameState(player.id),
            lastAction: {
              playerId: socket.id,
              action: 'guess',
              result: result.correct ? 'correct' : 'incorrect',
              guessInfo: {
                ...result.guessInfo,
                revealedCard: result.revealedCard || null
              }
            }
          });
        });
      }

      // 게임 종료 처리
      if (result.gameEnded) {
        io.to(room.id).emit('game-ended', {
          winner: result.winner
        });
      } else {
        // 봇 턴이면 자동 실행
        await executeBotTurnIfNeeded(io, room, game);
      }
    } catch (error) {
      console.error('Error guessing card:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 턴 패스
  socket.on('pass-turn', async (data, callback) => {
    try {
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = game.passTurn(socket.id);

      if (!result.success) {
        callback(result);
        return;
      }

      callback(result);

      // 모든 플레이어에게 게임 상태 업데이트 전송
      const room = gameManager.getRoomByPlayerId(socket.id);

      if (room) {
        room.players.forEach(player => {
          io.to(player.id).emit('game-updated', {
            gameState: game.getGameState(player.id)
          });
        });

        // 봇 턴이면 자동 실행
        await executeBotTurnIfNeeded(io, room, game);
      }
    } catch (error) {
      console.error('Error passing turn:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 현재 게임 상태 요청
  socket.on('get-game-state', (callback) => {
    try {
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const gameState = game.getGameState(socket.id);
      callback({ success: true, gameState });
    } catch (error) {
      console.error('Error getting game state:', error);
      callback({ success: false, error: error.message });
    }
  });

  // 방 나가기
  socket.on('leave-room', (callback) => {
    try {
      const result = gameManager.leaveRoom(socket.id);

      if (result.success) {
        const roomId = result.roomId;
        socket.leave(roomId);

        // 남은 플레이어에게 알림
        io.to(roomId).emit('player-left', {
          playerId: socket.id
        });

        // 방 목록 업데이트
        io.emit('rooms-updated', gameManager.getAllRooms());
      }

      if (callback) callback(result);
    } catch (error) {
      console.error('Error leaving room:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    const room = gameManager.getRoomByPlayerId(socket.id);

    if (room) {
      gameManager.leaveRoom(socket.id);

      // 남은 플레이어에게 알림
      io.to(room.id).emit('player-left', {
        playerId: socket.id
      });

      // 방 목록 업데이트
      io.emit('rooms-updated', gameManager.getAllRooms());
    }
  });
}

module.exports = setupGameHandlers;
