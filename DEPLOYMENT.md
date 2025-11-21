# AWS Lightsail 배포 가이드

## 서버 정보
- IP: `13.124.103.200`
- SSH Key: `davinci.pem`
- User: `ubuntu` (또는 `bitnami`)

## 사전 준비

### 1. 클라이언트 빌드
배포 전에 React 앱을 빌드해야 합니다:

```bash
cd client
npm run build
```

이 명령은 `client/build` 폴더를 생성합니다.

### 2. SSH 키 권한 설정 (로컬)
```bash
chmod 400 davinci.pem
```

## 배포 방법

### 방법 1: 자동 배포 스크립트 사용

```bash
chmod +x deploy.sh
./deploy.sh
```

### 방법 2: 수동 배포

#### Step 1: SSH 접속
```bash
ssh -i davinci.pem ubuntu@13.124.103.200
```

#### Step 2: Node.js 설치 (Ubuntu인 경우)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: PM2 설치
```bash
sudo npm install -g pm2
```

#### Step 4: Nginx 설치
```bash
sudo apt update
sudo apt install -y nginx
```

#### Step 5: 앱 디렉토리 생성
```bash
mkdir -p ~/davinci-code/server
mkdir -p ~/davinci-code/client/build
mkdir -p ~/davinci-code/logs
```

#### Step 6: 파일 업로드 (로컬에서 실행)

**서버 파일:**
```bash
scp -i davinci.pem -r server/* ubuntu@13.124.103.200:~/davinci-code/server/
```

**클라이언트 빌드 파일:**
```bash
scp -i davinci.pem -r client/build/* ubuntu@13.124.103.200:~/davinci-code/client/build/
```

**설정 파일:**
```bash
scp -i davinci.pem ecosystem.config.js ubuntu@13.124.103.200:~/davinci-code/
scp -i davinci.pem nginx.conf ubuntu@13.124.103.200:~/davinci-code/
```

#### Step 7: 서버에서 설치 및 실행
```bash
# SSH 접속
ssh -i davinci.pem ubuntu@13.124.103.200

# 서버 의존성 설치
cd ~/davinci-code/server
npm install --production

# PM2로 앱 시작
cd ~/davinci-code
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 8: Nginx 설정
```bash
# Nginx 설정 복사
sudo cp ~/davinci-code/nginx.conf /etc/nginx/sites-available/davinci-code

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/davinci-code /etc/nginx/sites-enabled/

# 기본 설정 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 방화벽 설정 (Lightsail 콘솔)

Lightsail 인스턴스의 네트워킹 탭에서 다음 포트를 열어야 합니다:

- **HTTP (80)** - 웹 접속
- **HTTPS (443)** - SSL (나중에 추가)
- **SSH (22)** - 이미 열려있음

## 확인

브라우저에서 접속:
```
http://13.124.103.200
```

## PM2 명령어

```bash
# 앱 상태 확인
pm2 status

# 로그 보기
pm2 logs davinci-code-server

# 앱 재시작
pm2 restart davinci-code-server

# 앱 중지
pm2 stop davinci-code-server

# 앱 삭제
pm2 delete davinci-code-server
```

## 업데이트 배포

코드 수정 후 다시 배포:

```bash
# 1. 클라이언트 빌드 (로컬)
cd client
npm run build

# 2. 파일 업로드
scp -i davinci.pem -r server/* ubuntu@13.124.103.200:~/davinci-code/server/
scp -i davinci.pem -r client/build/* ubuntu@13.124.103.200:~/davinci-code/client/build/

# 3. 서버 재시작 (SSH)
ssh -i davinci.pem ubuntu@13.124.103.200
pm2 restart davinci-code-server
```

## 트러블슈팅

### 연결 안될 때
```bash
# 서버 로그 확인
pm2 logs davinci-code-server

# Nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 포트 확인
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
```

### 권한 문제
```bash
# 파일 권한 설정
chmod -R 755 ~/davinci-code
```

### PM2 자동 시작 안될 때
```bash
pm2 unstartup
pm2 startup
pm2 save
```

## SSL 인증서 추가 (선택사항)

Let's Encrypt 무료 SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 환경 변수 설정 (선택사항)

`~/davinci-code/.env` 파일 생성:
```
NODE_ENV=production
PORT=3001
```

ecosystem.config.js에서 env_file 사용:
```javascript
env_file: './.env'
```
