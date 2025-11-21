import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 방 생성
  createRoom(playerName, callback) {
    this.socket.emit('create-room', { name: playerName }, callback);
  }

  // 방 참가
  joinRoom(roomId, playerName, callback) {
    this.socket.emit('join-room', { roomId, playerName }, callback);
  }

  // 방 목록 가져오기
  getRooms(callback) {
    this.socket.emit('get-rooms', callback);
  }

  // 카드 맞추기
  guessCard(cardIndex, number, color, callback) {
    this.socket.emit('guess-card', { cardIndex, number, color }, callback);
  }

  // 게임 상태 가져오기
  getGameState(callback) {
    this.socket.emit('get-game-state', callback);
  }

  // 방 나가기
  leaveRoom(callback) {
    this.socket.emit('leave-room', callback);
  }

  // 메시지 전송
  sendMessage(message, callback) {
    this.socket.emit('send-message', { message }, callback);
  }

  // 이벤트 리스너
  onRoomsUpdated(callback) {
    this.socket.on('rooms-updated', callback);
  }

  onPlayerJoined(callback) {
    this.socket.on('player-joined', callback);
  }

  onPlayerLeft(callback) {
    this.socket.on('player-left', callback);
  }

  onGameStarted(callback) {
    this.socket.on('game-started', callback);
  }

  onGameUpdated(callback) {
    this.socket.on('game-updated', callback);
  }

  onGameEnded(callback) {
    this.socket.on('game-ended', callback);
  }

  onNewMessage(callback) {
    this.socket.on('new-message', callback);
  }

  // 리스너 제거
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
