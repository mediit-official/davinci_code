#!/bin/bash

# AWS Lightsail 배포 스크립트
# 사용법: ./deploy.sh

SERVER_IP="13.124.103.200"
SSH_KEY="davinci.pem"
SERVER_USER="ubuntu"  # Node.js 이미지의 경우 'bitnami', Ubuntu의 경우 'ubuntu'
APP_DIR="/home/$SERVER_USER/davinci-code"

echo "🚀 다빈치 코드 게임 배포 시작..."

# 1. 서버에 파일 업로드
echo "📦 파일 업로드 중..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $APP_DIR"

# 서버 파일 업로드
scp -i $SSH_KEY -r server/* $SERVER_USER@$SERVER_IP:$APP_DIR/server/

# 클라이언트 빌드 파일 업로드
scp -i $SSH_KEY -r client/build/* $SERVER_USER@$SERVER_IP:$APP_DIR/client/build/

# 설정 파일 업로드
scp -i $SSH_KEY ecosystem.config.js $SERVER_USER@$SERVER_IP:$APP_DIR/
scp -i $SSH_KEY nginx.conf $SERVER_USER@$SERVER_IP:$APP_DIR/

# 2. 서버에서 설치 및 실행
echo "🔧 서버 설정 중..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /home/ubuntu/davinci-code

# Node.js 설치 (Ubuntu인 경우)
if ! command -v node &> /dev/null
then
    echo "Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# PM2 설치
if ! command -v pm2 &> /dev/null
then
    echo "PM2 설치 중..."
    sudo npm install -g pm2
fi

# 서버 의존성 설치
cd server
npm install --production

# PM2로 앱 시작
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ 배포 완료!"
ENDSSH

echo "🎉 배포가 완료되었습니다!"
echo "🌐 http://$SERVER_IP 에서 확인하세요"
