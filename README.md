# 다빈치 코드 멀티플레이어 게임

2인용 실시간 다빈치 코드 게임

## 게임 규칙

- 2명의 플레이어가 각각 4장의 카드를 받습니다
- 카드는 0-11 숫자 (흰색/검은색)
- 자신의 카드는 오름차순으로 정렬하여 배치
- 차례대로 상대방의 카드 숫자와 색을 맞춥니다
- 맞추면 카드가 공개되고 추가 턴을 얻습니다
- 틀리면 자신의 카드 중 하나를 공개합니다
- 상대방의 모든 카드를 먼저 공개하면 승리

## 기술 스택

### Backend
- Node.js + Express
- Socket.IO (실시간 통신)
- SQLite (게임 기록)

### Frontend
- React
- Socket.IO Client
- (추후 React Native로 모바일 확장)

## 프로젝트 구조

```
davinci_code/
├── server/              # 백엔드 서버
│   ├── src/
│   │   ├── game/       # 게임 로직
│   │   ├── models/     # 데이터 모델
│   │   ├── socket/     # Socket.IO 핸들러
│   │   ├── routes/     # API 라우트
│   │   └── server.js   # 서버 진입점
│   └── package.json
│
└── client/             # 프론트엔드
    ├── public/
    ├── src/
    │   ├── components/ # React 컴포넌트
    │   ├── pages/      # 페이지
    │   └── services/   # API/Socket 서비스
    └── package.json
```

## 설치 및 실행

### 서버 실행
```bash
cd server
npm install
npm run dev
```

### 클라이언트 실행
```bash
cd client
npm install
npm start
```

## 기능

- [x] 방 생성/참가 시스템
- [x] 2인 실시간 게임 플레이
- [x] 채팅 기능
- [x] 게임 기록/통계
- [ ] 관전 모드 (추후)
- [ ] 모바일 앱 (React Native)
