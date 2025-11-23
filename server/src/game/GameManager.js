const Game = require('./Game');
const BotPlayer = require('./BotPlayer');
const { v4: uuidv4 } = require('uuid');

class GameManager {
  constructor() {
    this.rooms = new Map(); // roomId -> room info
    this.games = new Map(); // roomId -> Game instance
    this.playerRooms = new Map(); // playerId -> roomId
    this.bots = new Map(); // roomId -> BotPlayer instance
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

  // 봇과 함께 게임 생성
  createRoomWithBot(hostPlayer) {
    const roomId = uuidv4();
    const botPlayer = {
      id: 'bot-' + uuidv4(),
      name: 'AI Bot',
      isBot: true
    };

    const room = {
      id: roomId,
      host: hostPlayer,
      players: [hostPlayer, botPlayer],
      status: 'playing', // 바로 게임 시작
      createdAt: Date.now(),
      hasBot: true
    };

    this.rooms.set(roomId, room);
    this.playerRooms.set(hostPlayer.id, roomId);
    this.playerRooms.set(botPlayer.id, roomId);

    // 게임 생성
    const game = new Game(roomId, hostPlayer, botPlayer);
    this.games.set(roomId, game);

    // 봇 플레이어 생성
    const bot = new BotPlayer(game, botPlayer.id);
    this.bots.set(roomId, bot);

    return { room, game, bot };
  }

  getBot(roomId) {
    return this.bots.get(roomId);
  }

  // 봇의 턴인지 확인
  isBotTurn(roomId) {
    const game = this.games.get(roomId);
    if (!game) return false;

    const currentPlayer = game.getCurrentPlayer();
    return currentPlayer.id.startsWith('bot-');
  }
}

module.exports = new GameManager();
