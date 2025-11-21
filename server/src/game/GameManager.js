const Game = require('./Game');
const { v4: uuidv4 } = require('uuid');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> room info
    this.games = new Map(); // roomId -> Game instance
    this.playerRooms = new Map(); // playerId -> roomId
  }

  createRoom(hostPlayer) {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      host: hostPlayer,
      players: [hostPlayer],
      status: 'waiting', // waiting, playing, finished
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostPlayer.id, roomId);

    return room;
  }

  joinRoom(roomId, player) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    if (room.players.length >= 2) {
      return { success: false, error: 'Room is full' };
    }

    room.players.push(player);
    this.playerRooms.set(player.id, roomId);

    // 2명이 되면 게임 시작
    if (room.players.length === 2) {
      this.startGame(roomId);
    }

    return { success: true, room };
  }

  startGame(roomId) {
    const room = this.rooms.get(roomId);

    if (!room || room.players.length !== 2) {
      return { success: false, error: 'Cannot start game' };
    }

    room.status = 'playing';
    const game = new Game(roomId, room.players[0], room.players[1]);
    this.games.set(roomId, game);

    return { success: true, game };
  }

  getGame(roomId) {
    return this.games.get(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomByPlayerId(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  getGameByPlayerId(playerId) {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.games.get(roomId) : null;
  }

  leaveRoom(playerId) {
    const roomId = this.playerRooms.get(playerId);

    if (!roomId) {
      return { success: false, error: 'Not in any room' };
    }

    const room = this.rooms.get(roomId);

    if (room) {
      room.players = room.players.filter(p => p.id !== playerId);

      // 방에 아무도 없으면 삭제
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
        this.games.delete(roomId);
      }
    }

    this.playerRooms.delete(playerId);

    return { success: true, roomId };
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).filter(room => room.status === 'waiting');
  }
}

module.exports = new GameManager();
