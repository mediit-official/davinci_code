const gameManager = require('../game/GameManager');

function setupChatHandlers(io, socket) {
  // 채팅 메시지 전송
  socket.on('send-message', (data, callback) => {
    try {
      const { message } = data;
      const room = gameManager.getRoomByPlayerId(socket.id);

      if (!room) {
        if (callback) callback({ success: false, error: 'Not in a room' });
        return;
      }

      const player = room.players.find(p => p.id === socket.id);
      const chatMessage = {
        id: Date.now(),
        playerId: socket.id,
        playerName: player ? player.name : 'Unknown',
        message,
        timestamp: Date.now()
      };

      // 방의 모든 플레이어에게 메시지 전송
      io.to(room.id).emit('new-message', chatMessage);

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Error sending message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });
}

module.exports = setupChatHandlers;
