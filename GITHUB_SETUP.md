# GitHub 연동 가이드

## 1. GitHub 저장소 생성

### 방법 1: GitHub 웹사이트에서 생성 (권장)

1. **GitHub 로그인**
   - https://github.com 접속 및 로그인

2. **새 저장소 생성**
   - 우측 상단 `+` 버튼 → `New repository` 클릭
   - Repository name: `reloop-prt` (또는 원하는 이름)
   - Description: "실패를 기록하고 다시 도전하세요 - PWA 앱"
   - Public 또는 Private 선택
   - **Initialize this repository with** 체크박스는 모두 해제 (이미 로컬에 코드가 있으므로)
   - `Create repository` 클릭

3. **저장소 URL 복사**
   - 생성된 저장소 페이지에서 URL 복사
   - 예: `https://github.com/사용자명/reloop-prt.git`

### 방법 2: GitHub CLI 사용

```bash
gh repo create reloop-prt --public --source=. --remote=origin --push
```

## 2. 로컬 저장소와 GitHub 연동

### 저장소 URL이 있다면:

```bash
cd /Users/idohyeong/Desktop/reloop-prt

# 원격 저장소 추가
git remote add origin https://github.com/사용자명/reloop-prt.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

## 3. 환경 변수 파일 제외 확인

`.gitignore`에 다음이 포함되어 있는지 확인:
- `.env*.local`
- `.env`
- `node_modules/`

**중요:** API 키나 비밀 정보는 절대 커밋하지 마세요!

## 4. GitHub에 푸시 후 확인

1. GitHub 저장소 페이지에서 파일들이 올라갔는지 확인
2. `README.md` 파일이 제대로 표시되는지 확인

## 5. 향후 업데이트

```bash
# 변경사항 추가
git add .

# 커밋
git commit -m "변경 내용 설명"

# GitHub에 푸시
git push
```

## 문제 해결

### 인증 오류가 발생하는 경우:

**Personal Access Token 사용:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. `Generate new token` 클릭
3. 권한 선택: `repo` (전체)
4. 토큰 생성 후 복사
5. 푸시 시 비밀번호 대신 토큰 사용

**또는 SSH 키 사용:**
```bash
# SSH 키 생성 (아직 없다면)
ssh-keygen -t ed25519 -C "your_email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key에 추가
```

