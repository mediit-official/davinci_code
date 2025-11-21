const gameManager = require('../game/GameManager');

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

      // 게임이 시작되었으면 알림
      if (result.room.status === 'playing') {
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

  // 카드 맞추기
  socket.on('guess-card', (data, callback) => {
    try {
      const { cardIndex, number, color } = data;
      const game = gameManager.getGameByPlayerId(socket.id);

      if (!game) {
        callback({ success: false, error: 'Game not found' });
        return;
      }

      const result = game.guessCard(socket.id, cardIndex, number, color);

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
            gameState: game.getGameState(player.id),
            lastAction: {
              playerId: socket.id,
              action: 'guess',
              result: result.correct ? 'correct' : 'incorrect'
            }
          });
        });
      }

      // 게임 종료 처리
      if (result.gameEnded) {
        io.to(room.id).emit('game-ended', {
          winner: result.winner
        });
      }
    } catch (error) {
      console.error('Error guessing card:', error);
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
