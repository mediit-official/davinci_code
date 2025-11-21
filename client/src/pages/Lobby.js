import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';
import './Lobby.css';

function Lobby({ onGameStart }) {
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    socketService.connect();

    // 방 목록 업데이트
    socketService.onRoomsUpdated((updatedRooms) => {
      setRooms(updatedRooms);
    });

    // 플레이어 참가 이벤트
    socketService.onPlayerJoined((data) => {
      setCurrentRoom(data.room);
    });

    // 게임 시작 이벤트
    socketService.onGameStarted((data) => {
      onGameStart(data.gameState);
    });

    // 초기 방 목록 가져오기
    socketService.getRooms((response) => {
      if (response.success) {
        setRooms(response.rooms);
      }
    });

    return () => {
      socketService.off('rooms-updated');
      socketService.off('player-joined');
      socketService.off('game-started');
    };
  }, [onGameStart]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }

    socketService.createRoom(playerName, (response) => {
      if (response.success) {
        setCurrentRoom(response.room);
        setIsInRoom(true);
      } else {
        alert('방 생성 실패: ' + response.error);
      }
    });
  };

  const handleJoinRoom = (roomId) => {
    if (!playerName.trim()) {
      alert('이름을 입력해주세요!');
      return;
    }

    socketService.joinRoom(roomId, playerName, (response) => {
      if (response.success) {
        setCurrentRoom(response.room);
        setIsInRoom(true);
      } else {
        alert('방 참가 실패: ' + response.error);
      }
    });
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom((response) => {
      if (response.success) {
        setIsInRoom(false);
        setCurrentRoom(null);
      }
    });
  };

  if (isInRoom && currentRoom) {
    return (
      <div className="lobby">
        <div className="waiting-room">
          <h2>대기실</h2>
          <p className="room-id">방 ID: {currentRoom.id}</p>

          <div className="players-list">
            <h3>플레이어 ({currentRoom.players.length}/2)</h3>
            {currentRoom.players.map((player, index) => (
              <div key={player.id} className="player-item">
                {player.name} {index === 0 && '(방장)'}
              </div>
            ))}
          </div>

          {currentRoom.players.length < 2 ? (
            <p className="waiting-message">상대방을 기다리는 중...</p>
          ) : (
            <p className="starting-message">게임이 곧 시작됩니다!</p>
          )}

          <button className="leave-room-btn" onClick={handleLeaveRoom}>
            방 나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>다빈치 코드</h1>
        <p className="subtitle">2인용 멀티플레이어 게임</p>
      </div>

      <div className="player-name-section">
        <input
          type="text"
          placeholder="플레이어 이름 입력"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
        <button onClick={handleCreateRoom} className="create-room-btn">
          방 만들기
        </button>
      </div>

      <div className="rooms-section">
        <h2>대기 중인 방 ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <p className="no-rooms">대기 중인 방이 없습니다. 새로운 방을 만들어보세요!</p>
        ) : (
          <div className="rooms-list">
            {rooms.map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-info">
                  <h3>{room.host.name}의 방</h3>
                  <p>플레이어: {room.players.length}/2</p>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="join-btn"
                >
                  참가하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lobby;
