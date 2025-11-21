const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupGameHandlers = require('./socket/gameHandler');
const setupChatHandlers = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors());
app.use(express.json());

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Davinci Code Game Server',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // 게임 핸들러 설정
  setupGameHandlers(io, socket);

  // 채팅 핸들러 설정
  setupChatHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server is ready`);
});
