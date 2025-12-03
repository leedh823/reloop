# Reloop

실패를 공유하고 디스코드에서 함께 이야기할 수 있는 커뮤니티 웹앱입니다.

## 프로젝트 소개

**Reloop**는 실패를 부끄럽게 여기지 않고, 함께 성장할 수 있는 커뮤니티 플랫폼입니다. 사용자들이 경험한 실패를 공유하고, 디스코드 채널에서 함께 이야기하며 다음 도전을 준비할 수 있습니다.

### 핵심 가치

- **실패 공유**: 솔직하고 투명한 실패 경험 공유
- **커뮤니티 연결**: 디스코드 웹훅을 통한 실시간 알림 및 소통
- **다시 도전**: 실패를 통해 배우고 성장하는 문화 조성

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Discord Webhook**

## 로컬 개발 방법

### 1. 저장소 클론

```bash
git clone https://github.com/leedh823/reloop.git
cd reloop
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 Discord Webhook URL을 설정하세요:

```bash
# .env.local 파일 생성
touch .env.local
```

`.env.local` 파일 내용:

```env
# Discord Webhook URL
# 디스코드 채널 설정 > 연동 > 웹후크 > 새 웹후크 만들기
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
```

**Discord Webhook URL 생성 방법:**
1. Discord 채널에서 채널 설정(톱니바퀴 아이콘) 클릭
2. **연동** > **웹후크** 메뉴 선택
3. **새 웹후크 만들기** 클릭
4. 웹후크 이름 설정 후 **웹후크 URL 복사**
5. 복사한 URL을 `.env.local` 파일의 `DISCORD_WEBHOOK_URL`에 붙여넣기

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로덕션 빌드 및 테스트

### 빌드

프로덕션 빌드를 생성합니다:

```bash
npm run build
```

빌드가 성공적으로 완료되면 `.next` 폴더에 최적화된 프로덕션 빌드가 생성됩니다.

### 프로덕션 서버 실행

로컬에서 프로덕션 빌드를 테스트하려면:

```bash
npm start
```

이 명령어는 프로덕션 모드로 서버를 실행합니다. [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## GitHub + Vercel 배포

### 1. GitHub 저장소에 푸시

```bash
# Git 초기화 (아직 안 했다면)
git init

# 원격 저장소 추가
git remote add origin https://github.com/leedh823/reloop.git

# 파일 추가 및 커밋
git add .
git commit -m "Initial commit: Reloop 프로젝트"

# 메인 브랜치에 푸시
git branch -M main
git push -u origin main
```

### 2. Vercel에 배포

#### 방법 1: Vercel 대시보드에서 배포

1. [Vercel](https://vercel.com)에 로그인
2. **Add New Project** 클릭
3. GitHub 저장소 선택 (leedh823/reloop)
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
5. **Environment Variables** 섹션에서 환경 변수 추가:
   - **Key**: `DISCORD_WEBHOOK_URL`
   - **Value**: Discord Webhook URL
   - **Environment**: Production, Preview, Development 모두 선택
6. **Deploy** 클릭

#### 방법 2: Vercel CLI로 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

배포 중 환경 변수를 입력하라는 프롬프트가 나타나면 `DISCORD_WEBHOOK_URL`을 입력하세요.

### 3. 환경 변수 설정 (Vercel 대시보드)

배포 후에도 환경 변수를 추가/수정할 수 있습니다:

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Environment Variables** 메뉴로 이동
3. 환경 변수 추가:
   - **Name**: `DISCORD_WEBHOOK_URL`
   - **Value**: Discord Webhook URL
   - **Environment**: Production, Preview, Development 모두 선택
4. **Save** 클릭
5. 변경사항 적용을 위해 **Redeploy** 실행

### 4. 자동 배포 설정

Vercel은 GitHub 저장소와 연결되면 자동으로 배포됩니다:

- **메인 브랜치에 푸시**: 프로덕션 자동 배포
- **다른 브랜치에 푸시**: 프리뷰 배포
- **Pull Request 생성**: 프리뷰 배포

## 프로젝트 구조

```
reloop-prt/
├── app/
│   ├── api/
│   │   └── failures/
│   │       ├── route.ts          # GET, POST /api/failures
│   │       └── [id]/
│   │           └── route.ts      # GET /api/failures/[id]
│   ├── failures/
│   │   ├── page.tsx              # 실패 목록 페이지
│   │   └── [id]/
│   │       └── page.tsx          # 실패 상세 페이지
│   ├── submit/
│   │   └── page.tsx              # 실패 작성 폼
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 랜딩 페이지
│   └── globals.css               # 글로벌 스타일
├── components/
│   └── Navbar.tsx                # 네비게이션 바
├── lib/
│   ├── db.ts                     # 메모리 기반 가짜 DB
│   └── discord.ts                # Discord Webhook 연동
├── types/
│   └── index.ts                  # TypeScript 타입 정의
├── vercel.json                   # Vercel 배포 설정
└── package.json
```

## 주요 기능

### 페이지

- **/** - 랜딩 페이지 (브랜드 소개 + How it works + Discord 안내)
- **/submit** - 실패 작성 폼
- **/failures** - 실패 카드 리스트
- **/failures/[id]** - 실패 상세 페이지

### API

- **GET /api/failures** - 모든 실패 목록 조회
- **POST /api/failures** - 새 실패 생성 (Discord Webhook 전송)
- **GET /api/failures/[id]** - 특정 실패 조회

### 데이터 모델

```typescript
interface Failure {
  id: string
  title: string
  summary: string
  content: string
  emotionTag: string
  category: string
  pdfUrl?: string
  createdAt: Date
}
```

## 브랜딩

- **메인 컬러**: #359DFE (Reloop Blue)
- **서브 컬러**: #9F9366 (골드), #ACACAC (실버)
- **톤앤매너**: 심플, 밝은 블루, 신뢰감, '다시 도전'에 초점

## 참고사항

### 데이터 저장

- 현재는 메모리 기반 가짜 DB를 사용합니다.
- 서버를 재시작하면 모든 데이터가 초기화됩니다.
- 프로덕션 환경에서는 실제 데이터베이스(PostgreSQL, MongoDB 등)를 사용하는 것을 권장합니다.

### Discord Webhook

- Discord Webhook URL이 설정되지 않아도 앱은 정상 작동합니다.
- 단, 새 실패가 생성될 때 Discord 알림이 전송되지 않습니다.
- 로컬 개발과 프로덕션 환경 모두에서 환경 변수 설정이 필요합니다.

## 라이선스

MIT
