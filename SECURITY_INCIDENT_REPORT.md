# 🚨 보안 사고 보고서 - SSH 키 노출 사건

## 📅 발생 일시
- **발생**: 2025년 11월 22일
- **발견**: GitGuardian 자동 스캔
- **대응 시작**: 2025년 11월 22일
- **현재 상태**: 부분 해결 (GitHub 정리 완료, 키 교체 필요)

---

## 🔴 사고 내용

### 노출된 파일
1. `davinci.pem` - RSA Private Key
2. `LightsailDefaultKey-ap-northeast-2.pem` - RSA Private Key

### 노출 경로
- **GitHub 공개 저장소**: `mediit-official/davinci_code`
- **커밋 히스토리**: 전체 Git 히스토리에 포함됨
- **외부 스캔**: GitGuardian이 이미 감지

### 영향 범위
- ✅ **확인된 영향**:
  - 다빈치 코드 게임 서버 (13.124.103.200)
- ⚠️ **잠재적 영향**:
  - **동일한 키를 사용하는 다른 Lightsail 인스턴스 전체**
  - AWS 계정 내 같은 키페어를 사용하는 모든 서버

---

## ✅ 완료된 조치

### 1. GitHub 저장소 정리
- [x] Git tracking에서 .pem 파일 제거
- [x] .gitignore에 `*.pem`, `*.key`, `*.tar.gz` 추가
- [x] **Git 전체 히스토리에서 .pem 파일 영구 삭제** (`git filter-branch` 사용)
- [x] GitHub에 강제 푸시 (force push)
- [x] 로컬 Git refs 정리 및 garbage collection

**결과**: GitHub 저장소에서 키 파일이 완전히 제거됨

---

## ⚠️ 남은 위험 요소

### 🔴 심각: 노출된 키가 여전히 유효함

**문제점:**
1. **이미 노출된 키는 변경되지 않음**
   - GitHub에서 삭제했지만, GitGuardian 등이 이미 스캔함
   - 악의적 사용자가 키를 저장했을 수 있음
   - 키 자체가 바뀌지 않으면 여전히 위험

2. **같은 키를 사용하는 다른 인스턴스도 위험**
   ```
   davinci.pem 또는 LightsailDefaultKey-ap-northeast-2.pem을
   사용하는 모든 Lightsail 인스턴스가 동일하게 노출됨
   ```

3. **현재 접근 가능 상태**
   - 노출된 키로 여전히 서버 접속 가능
   - 누구든 다운로드한 키 파일로 SSH 접속 시도 가능

---

## 🎯 필수 조치 사항

### 우선순위 1: 즉시 실행 필요 ⚡

#### A. 영향받는 모든 인스턴스 확인
```bash
# AWS Lightsail 콘솔에서 확인 필요
1. 모든 인스턴스 목록 확인
2. 각 인스턴스가 사용하는 키페어 확인
3. davinci.pem 또는 LightsailDefaultKey-ap-northeast-2.pem 사용하는 인스턴스 식별
```

#### B. 모든 영향받는 인스턴스에 새 키 추가

**방법**: SSH를 통해 새 공개키를 authorized_keys에 추가

**장점**:
- 기존 키도 작동하면서 새 키 추가 가능
- 한 번에 하나씩 안전하게 마이그레이션
- 실수해도 기존 키로 복구 가능

**단점**:
- 각 인스턴스에 개별 접속 필요

#### C. 새 키 테스트 후 기존 키 제거

---

## 📋 권장 해결 방법

### Step 1: 새 SSH 키 생성 (로컬)
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/lightsail-new-key -C "lightsail-secure-key-2025"
```

**결과**:
- `lightsail-new-key` (개인키 - 안전하게 보관!)
- `lightsail-new-key.pub` (공개키 - 서버에 추가할 것)

### Step 2: 영향받는 모든 인스턴스 확인
AWS Lightsail 콘솔에서:
1. Instances 메뉴
2. 각 인스턴스의 "Connect" 탭
3. "SSH key pair" 확인
4. `davinci` 또는 `LightsailDefaultKey-ap-northeast-2` 사용하는 인스턴스 목록 작성

### Step 3: 각 인스턴스에 새 공개키 추가

**현재 접속 가능한 다빈치 서버 (13.124.103.200)**:
```bash
# 서버에서 실행
echo "새공개키내용" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**다른 인스턴스들**:
```bash
# 로컬에서 실행 (각 인스턴스마다)
ssh -i davinci.pem user@인스턴스IP "echo '새공개키내용' >> ~/.ssh/authorized_keys"
```

### Step 4: 새 키로 접속 테스트
```bash
ssh -i ~/.ssh/lightsail-new-key bitnami@13.124.103.200
```

### Step 5: 성공 확인 후 기존 키 제거
```bash
# 각 서버의 authorized_keys에서 기존 키 라인 삭제
ssh -i ~/.ssh/lightsail-new-key bitnami@인스턴스IP
nano ~/.ssh/authorized_keys
# davinci.pem에 해당하는 라인 삭제
```

### Step 6: AWS 콘솔에서 기존 키페어 삭제
- AWS Lightsail → Account → SSH keys
- `davinci` 및 `LightsailDefaultKey-ap-northeast-2` 삭제

---

## 🤔 대체 방안

### 방안 1: 이 서버만 먼저 교체
**장점**: 빠르고 간단
**단점**: 다른 인스턴스는 여전히 위험

### 방안 2: 모든 인스턴스 일괄 교체 (권장)
**장점**: 보안 위험 완전 제거
**단점**: 시간 소요, 각 인스턴스 접속 필요

### 방안 3: AWS Support 문의
**장점**: 전문가 도움
**단점**: 시간 소요, 비용 가능성

---

## ⏰ 긴급도 평가

### 🔴 높음 (즉시 조치)
- [x] GitHub에서 키 제거 ✅ 완료
- [ ] 새 SSH 키 생성
- [ ] 영향받는 인스턴스 확인
- [ ] 새 키를 모든 영향받는 인스턴스에 추가

### 🟡 중간 (24시간 내)
- [ ] 새 키 테스트
- [ ] 기존 키 제거

### 🟢 낮음 (1주일 내)
- [ ] AWS 콘솔에서 기존 키페어 삭제
- [ ] 보안 정책 문서화
- [ ] .gitignore 검증

---

## 📝 배운 교훈

### 실수 원인
- SSH 키를 Git 저장소에 커밋함
- .gitignore에 *.pem이 사전에 등록되지 않음
- 공개 저장소에 민감 정보 업로드

### 예방 방법
1. **사전 .gitignore 설정**
   ```gitignore
   *.pem
   *.key
   *.p12
   *.pfx
   .env
   ```

2. **Pre-commit Hook 사용**
   - 민감 정보 패턴 검사
   - GitGuardian CLI 통합

3. **정기 보안 스캔**
   - GitHub Secret Scanning 활성화
   - GitGuardian 모니터링

4. **키 관리 Best Practice**
   - SSH 키는 `~/.ssh/` 디렉토리에만 보관
   - 프로젝트 폴더에 절대 복사하지 않기
   - 키 교체 주기 설정 (3-6개월)

---

## 📞 다음 단계

### 즉시 결정 필요:
1. **영향받는 다른 인스턴스가 있는지 확인**
   - 있다면: 모든 인스턴스에 새 키 추가 (방안 2)
   - 없다면: 이 서버만 교체 (방안 1)

2. **조치 방법 선택**
   - A) 직접 수동으로 진행
   - B) 도움 받아 진행 (스크립트 작성 가능)

### 준비 사항:
- [ ] AWS Lightsail 콘솔 접속 권한 확인
- [ ] 다른 인스턴스 목록 및 사용 중인 키 확인
- [ ] 새 SSH 키 생성 (로컬)
- [ ] 공개키 내용 복사 준비

---

## 🔐 보안 체크리스트

### GitHub
- [x] .pem 파일 제거
- [x] .gitignore에 *.pem 추가
- [x] Git 히스토리 정리
- [x] 강제 푸시

### AWS Lightsail
- [ ] 영향받는 인스턴스 확인
- [ ] 새 키 생성
- [ ] 새 키 추가
- [ ] 새 키 테스트
- [ ] 기존 키 제거
- [ ] 기존 키페어 삭제

### 모니터링
- [ ] GitGuardian 경고 확인
- [ ] AWS CloudTrail 로그 확인 (의심스러운 접속)
- [ ] 서버 접속 로그 확인 (`/var/log/auth.log`)

---

## 📊 현재 상태 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| GitHub 키 제거 | ✅ 완료 | Git 히스토리 포함 |
| .gitignore 설정 | ✅ 완료 | *.pem, *.key 추가 |
| 다빈치 서버 (13.124.103.200) | ⚠️ 위험 | 노출된 키로 여전히 접근 가능 |
| 다른 인스턴스 | ⚠️ 확인 필요 | 같은 키 사용 시 위험 |
| 새 키 생성 | ❌ 미완료 | 즉시 필요 |
| 키 교체 | ❌ 미완료 | 즉시 필요 |

---

## 💬 질문 사항

1. **다른 Lightsail 인스턴스가 있나요?**
   - 있다면 몇 개인가요?
   - 같은 키(`davinci.pem`)를 사용하나요?

2. **키 교체 방법 선호도**
   - A) 제가 스크립트 만들어서 일괄 처리
   - B) 직접 하나씩 수동으로 진행
   - C) AWS 콘솔에서 새 키페어 생성 후 교체

3. **우선순위**
   - 이 서버만 먼저? vs 모든 인스턴스 동시에?

---

**작성일**: 2025-11-22
**작성자**: Claude Code
**문서 버전**: 1.0
