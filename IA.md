# Reloop IA & Information Architecture

## 개요

Reloop는 실패를 기록하고 공유하는 커뮤니티 플랫폼입니다. Behance 스타일의 포트폴리오 레이아웃을 기반으로 하되, 포트폴리오 대신 "실패 기록"이 쌓이는 공간으로 구성됩니다. AI를 통해 감정과 내용을 정리하고, Discord에서 사람들과 소통하는 것이 핵심 기능입니다.

**톤 앤 매너:**
- 어두운 배경 (#000) + 밝은 카드 (#1a1a1a)
- Reloop Blue (#359DFE) 포인트 컬러
- 부드러운 타이포그래피
- Behance 스타일의 여유 있는 레이아웃

---

## 1. 상위 IA (사이트맵)

### 1.1 페이지 구조

| Depth | 경로 | 페이지명 | 목적 | 주요 콘텐츠/섹션 | 주요 인터랙션 |
|-------|------|----------|------|------------------|---------------|
| 1 | `/` | Home | 실패 카드 탐색 및 서비스 소개 | Hero 섹션, 카테고리/감정 필터, 실패 카드 그리드 | 필터링, 검색, 카드 클릭 |
| 1 | `/failures` | Failures List | 실패 목록 전체 보기 | 카드 캐러셀, 그리드 리스트 | 필터링, 정렬, 카드 클릭 |
| 2 | `/failures/[id]` | Failure Detail | 실패 상세 내용 보기 | 제목, 요약, 상세 내용, 태그, 메타 정보 | AI 채팅 열기, Discord 링크, 공유 |
| 1 | `/submit` | Submit Failure | 새 실패 작성 및 공유 | 작성 폼 (제목, 요약, 내용, 카테고리, 감정, 썸네일, 작성자) | 폼 제출, AI 정리 요청 (향후) |
| 1 | `/me` | My Page | 사용자 프로필 및 내 실패 목록 | 프로필 정보, 내가 작성한 실패 목록, 통계 | 프로필 편집, 실패 관리 |
| 1 | `/about` | About Reloop | 서비스 소개 및 브랜드 설명 | 서비스 비전, 팀 소개, 브랜드 가치 | CTA 버튼 (시작하기) |
| 1 | `/guide` | Guide | 실패 작성 가이드 및 커뮤니티 가이드라인 | 작성 팁, 커뮤니티 규칙, FAQ | 가이드 섹션 네비게이션 |

### 1.2 페이지별 상세 설명

#### `/` - Home
**목적:** 서비스 첫 인상 및 실패 카드 탐색

**주요 콘텐츠:**
- Hero 섹션: 큰 제목, 짧은 설명, CTA 버튼 3개 (실패 올리기, AI 정리 요청, Discord)
- 필터 바: 카테고리 탭, 감정 태그 필터, 검색 인풋
- 실패 카드 그리드: Behance 스타일의 카드 레이아웃

**주요 인터랙션:**
- 카테고리/감정 필터 선택 → 실시간 필터링
- 검색어 입력 → 제목/요약 검색
- 카드 클릭 → `/failures/[id]` 이동
- "실패 올리기" 버튼 → `/submit` 이동

#### `/failures` - Failures List
**목적:** 모든 실패 목록을 한눈에 보기

**주요 콘텐츠:**
- 상단: 가로 카드 캐러셀 (Fuckup Nights 스타일)
- 하단: 그리드 리스트 (기존 카드 스타일)

**주요 인터랙션:**
- 캐러셀 좌우 스크롤 (데스크탑 화살표 버튼)
- 그리드 카드 클릭 → 상세 페이지 이동
- "새 실패 공유하기" 버튼 → `/submit` 이동

#### `/failures/[id]` - Failure Detail
**목적:** 특정 실패의 상세 내용 읽기 및 감정 정리

**주요 콘텐츠:**
- 제목, 카테고리/감정 태그, 작성자, 날짜
- 요약, 상세 내용
- 관련 자료 (PDF 등)
- Discord CTA

**주요 인터랙션:**
- "감정 리루프 AI" 플로팅 버튼 → 사이드 패널 열기
- AI 채팅: 실패 컨텍스트 기반 감정 정리 대화
- "Discord에서 이야기하기" → Discord Thread 이동
- "목록으로 돌아가기" → `/failures` 이동

#### `/submit` - Submit Failure
**목적:** 새 실패 작성 및 공유

**주요 콘텐츠:**
- 작성 폼:
  - 제목 (필수)
  - 요약 (필수)
  - 상세 내용 (필수)
  - 카테고리 선택 (필수)
  - 감정 태그 선택 (필수)
  - 썸네일 이미지 URL (선택)
  - 작성자 이름 (선택)
  - PDF URL (선택)

**주요 인터랙션:**
- 폼 작성 및 제출
- 제출 시: `/api/failures` POST → Discord Webhook 전송 → `/failures/[id]` 이동
- "AI에게 정리 요청하기" (향후 기능)

#### `/me` - My Page
**목적:** 사용자 프로필 및 내 실패 관리

**주요 콘텐츠:**
- 프로필 섹션: 닉네임, 아바타, 소개, 가입일
- 내 실패 목록: 내가 작성한 실패 카드 그리드
- 통계: 작성한 실패 수, 받은 응답 수 등

**주요 인터랙션:**
- 프로필 편집
- 내 실패 수정/삭제
- 실패 카드 클릭 → 상세 페이지 이동

#### `/about` - About Reloop
**목적:** 서비스 소개 및 브랜드 가치 전달

**주요 콘텐츠:**
- 서비스 비전 및 미션
- 핵심 가치 (실패 공유, 커뮤니티 연결, 다시 도전)
- 팀 소개 (선택)
- 브랜드 컬러 및 톤앤매너

**주요 인터랙션:**
- "시작하기" CTA → `/submit` 또는 `/` 이동

#### `/guide` - Guide
**목적:** 실패 작성 가이드 및 커뮤니티 가이드라인

**주요 콘텐츠:**
- 실패를 잘 쓰는 방법
- 커뮤니티 가이드라인
- FAQ
- AI 채팅 사용법

**주요 인터랙션:**
- 가이드 섹션 네비게이션 (스크롤 앵커)
- 관련 페이지 링크

---

## 2. URL / 라우트 구조

### 2.1 Next.js App Router 구조

현재 프로젝트는 **App Router**를 사용합니다.

```
/app
├── layout.tsx                    # 루트 레이아웃 (Navbar 포함)
├── page.tsx                      # Home (/)
├── globals.css                   # 글로벌 스타일
│
├── failures/
│   ├── page.tsx                  # Failures List (/failures)
│   └── [id]/
│       └── page.tsx               # Failure Detail (/failures/[id])
│
├── submit/
│   └── page.tsx                  # Submit Failure (/submit)
│
├── me/
│   └── page.tsx                  # My Page (/me) [향후 구현]
│
├── about/
│   └── page.tsx                  # About Reloop (/about) [향후 구현]
│
├── guide/
│   └── page.tsx                  # Guide (/guide) [향후 구현]
│
└── api/
    ├── failures/
    │   ├── route.ts              # GET, POST /api/failures
    │   └── [id]/
    │       └── route.ts           # GET /api/failures/[id]
    └── ai/
        └── emotion-reflect/
            └── route.ts           # POST /api/ai/emotion-reflect
```

### 2.2 라우트별 상세

#### `/` - Home
- **파일:** `app/page.tsx`
- **타입:** Client Component
- **데이터:** `Failure[]` (API에서 가져오기)
- **레이아웃:** 루트 레이아웃 (Navbar 포함)
- **주요 기능:**
  - 클라이언트 사이드 필터링 (카테고리, 감정, 검색)
  - 실시간 검색 및 필터링

#### `/failures` - Failures List
- **파일:** `app/failures/page.tsx`
- **타입:** Server Component
- **데이터:** `Failure[]` (DB에서 직접 조회)
- **레이아웃:** 루트 레이아웃
- **주요 기능:**
  - 카드 캐러셀 (가로 스크롤)
  - 그리드 리스트

#### `/failures/[id]` - Failure Detail
- **파일:** `app/failures/[id]/page.tsx`
- **타입:** Server Component
- **데이터:** `Failure` (단일 객체)
- **레이아웃:** 루트 레이아웃
- **주요 기능:**
  - 실패 상세 내용 표시
  - AI 채팅 런처 포함

#### `/submit` - Submit Failure
- **파일:** `app/submit/page.tsx`
- **타입:** Client Component
- **데이터:** `CreateFailureRequest` (폼 데이터)
- **레이아웃:** 루트 레이아웃
- **주요 기능:**
  - 폼 작성 및 제출
  - API 호출 및 리다이렉트

#### `/me` - My Page (향후)
- **파일:** `app/me/page.tsx`
- **타입:** Server Component (또는 Client)
- **데이터:** `User`, `Failure[]` (사용자별)
- **레이아웃:** 루트 레이아웃
- **주요 기능:**
  - 프로필 표시 및 편집
  - 내 실패 목록 필터링

#### `/about` - About Reloop (향후)
- **파일:** `app/about/page.tsx`
- **타입:** Server Component
- **데이터:** 없음 (정적 콘텐츠)
- **레이아웃:** 루트 레이아웃

#### `/guide` - Guide (향후)
- **파일:** `app/guide/page.tsx`
- **타입:** Server Component
- **데이터:** 없음 (정적 콘텐츠)
- **레이아웃:** 루트 레이아웃

### 2.3 공통 레이아웃

**루트 레이아웃 (`app/layout.tsx`):**
- Navbar (상단 고정)
- 메인 콘텐츠 영역
- 글로벌 스타일 적용

**Navbar 구성:**
- 좌측: Reloop 로고 (홈 링크)
- 우측: "실패 목록", "실패 공유하기" 버튼

---

## 3. 도메인 모델 / 엔티티

### 3.1 엔티티 다이어그램

```
User (1) ────< (N) Failure
                │
                ├──> Category (M:N)
                ├──> EmotionTag (M:N)
                └──> AiSession (1:1, optional)
```

### 3.2 엔티티 상세

#### Failure
**역할:** 실패 기록의 핵심 엔티티

**필드:**
```typescript
{
  id: string                    // 고유 ID
  title: string                 // 제목
  summary: string              // 요약
  content: string               // 상세 내용
  category: string              // 카테고리 (job, school, side-project, etc.)
  emotionTag: string            // 감정 태그 (anxiety, frustration, regret, etc.)
  thumbnailUrl?: string         // 썸네일 이미지 URL
  pdfUrl?: string               // 관련 PDF URL
  author?: string               // 작성자 이름 (임시, 향후 User ID로 변경)
  authorId?: string             // 작성자 ID (User와의 관계)
  createdAt: Date               // 생성일시
  updatedAt?: Date               // 수정일시
  hasAiReview?: boolean         // AI 분석 여부
  hasDiscordThread?: boolean    // Discord 스레드 존재 여부
  discordThreadUrl?: string     // Discord 스레드 URL
}
```

**관계:**
- User 1 : N Failure (한 사용자가 여러 실패 작성)
- Failure M : N Category (향후 확장 가능)
- Failure M : N EmotionTag (향후 확장 가능)
- Failure 1 : 1 AiSession (선택적, AI 채팅 세션)

#### User
**역할:** 사용자 정보

**필드:**
```typescript
{
  id: string                    // 고유 ID
  nickname: string              // 닉네임
  avatarUrl?: string            // 아바타 이미지 URL
  bio?: string                  // 자기소개
  email?: string                // 이메일 (인증용)
  joinedAt: Date                // 가입일시
  discordUserId?: string        // Discord 연동 ID
}
```

**관계:**
- User 1 : N Failure

#### Category
**역할:** 실패 카테고리 분류

**필드:**
```typescript
{
  id: string                    // 고유 ID
  name: string                  // 카테고리명 (한글)
  slug: string                  // URL 슬러그 (영문)
  description?: string          // 설명
  color?: string                // 표시 색상 (예: #359DFE)
}
```

**예시 값:**
- `job` (취업)
- `school` (학교)
- `side-project` (사이드프로젝트)
- `relationship` (관계)
- `business` (비즈니스)
- `other` (기타)

#### EmotionTag
**역할:** 감정 태그 분류

**필드:**
```typescript
{
  id: string                    // 고유 ID
  name: string                  // 감정명 (한글)
  slug: string                  // URL 슬러그 (영문)
  description?: string          // 설명
  color?: string                // 표시 색상 (예: #9F9366)
}
```

**예시 값:**
- `anxiety` (불안)
- `frustration` (좌절)
- `regret` (후회)
- `relief` (안도)
- `growth` (성장)

#### AiSession (선택적)
**역할:** AI 채팅 세션 정보 (향후 확장용)

**필드:**
```typescript
{
  id: string                    // 고유 ID
  failureId: string             // 연결된 Failure ID
  userId?: string               // 사용자 ID (선택적)
  messages: ChatMessage[]       // 채팅 메시지 배열
  summary?: string              // AI가 생성한 요약
  createdAt: Date               // 생성일시
  updatedAt: Date                // 마지막 업데이트
}
```

**관계:**
- Failure 1 : 1 AiSession (선택적)

---

## 4. 페이지별 주요 플로우

### 4.1 실패 업로드 플로우

#### 사용자 관점
1. `/submit` 페이지 접속
2. 폼 작성:
   - 제목, 요약, 상세 내용 입력
   - 카테고리 선택
   - 감정 태그 선택
   - (선택) 썸네일 이미지 URL, 작성자 이름, PDF URL 입력
3. "공유하기" 버튼 클릭
4. 제출 완료 → `/failures/[id]` 페이지로 이동

#### 프론트엔드 작업
1. 폼 데이터 수집 (`CreateFailureRequest`)
2. `/api/failures` POST 요청
3. 응답 받은 Failure ID로 리다이렉트

#### 백엔드 작업
1. `/api/failures` POST 엔드포인트에서 요청 받기
2. 데이터 검증 (필수 필드 확인)
3. DB에 Failure 생성 (`createFailure`)
4. Discord Webhook으로 알림 전송 (`sendToDiscord`)
5. 생성된 Failure 객체 반환

**시퀀스 다이어그램:**
```
User → Frontend → API Route → DB
                          ↓
                    Discord Webhook
```

### 4.2 실패 상세 보기 + 감정 AI 플로우

#### 사용자 관점
1. `/failures/[id]` 페이지 접속
2. 실패 내용 읽기
3. 우하단 "감정 리루프 AI" 버튼 클릭
4. 사이드 패널 열림
5. AI와 대화:
   - 현재 감정이나 생각을 텍스트로 입력
   - AI가 공감 및 질문으로 응답
   - 여러 번 대화 반복
6. 감정 정리 완료 후 패널 닫기

#### 프론트엔드 작업
1. Failure 데이터 로드 (서버 컴포넌트)
2. `EmotionChatLauncher` 컴포넌트에 `failureSummary`, `emotionTag` 전달
3. 사용자 메시지 입력 시:
   - 사용자 메시지를 먼저 UI에 추가
   - `/api/ai/emotion-reflect` POST 요청
   - 요청 본문: `{ message, failureSummary, emotionTag }`
4. AI 응답 받아서 UI에 추가
5. 로딩 상태 및 에러 처리

#### 백엔드 작업
1. `/api/ai/emotion-reflect` POST 엔드포인트에서 요청 받기
2. OpenAI API 호출:
   - System 프롬프트: 공감 중심, 비평 지양, 안전 가이드라인
   - User 메시지: `failureSummary`와 `emotionTag`를 컨텍스트로 포함
   - 모델: `gpt-4o-mini`
3. OpenAI 응답 파싱
4. `{ reply: string }` 형태로 반환

**시퀀스 다이어그램:**
```
User → ChatPanel → API Route → OpenAI API
                ←            ←
```

**AI 컨텍스트 전달 방식:**
```typescript
{
  message: "지금 너무 좌절스러워요",
  failureSummary: "스타트업 면접에서 실수한 경험",
  emotionTag: "frustration"
}
```

이 정보가 System 프롬프트와 함께 OpenAI에 전달되어, AI가 실패의 맥락을 이해하고 더 정확한 공감과 질문을 제공할 수 있습니다.

### 4.3 Discord 링크/연동 플로우

#### 사용자 관점
1. `/failures/[id]` 페이지에서 실패 내용 읽기
2. 하단 "Discord에서 이어서 이야기하기" 버튼 클릭
3. Discord Thread/Channel로 이동 (새 탭)
4. Discord에서 실패에 대해 대화

#### 프론트엔드 작업
1. Failure 객체에서 `discordThreadUrl` 확인
2. 버튼 클릭 시:
   - URL이 있으면 해당 URL로 이동
   - URL이 없으면 Discord 서버 초대 링크로 이동 (또는 새 스레드 생성)

#### 백엔드 작업 (향후)
1. 실패 생성 시 Discord Webhook으로 알림 전송 (현재 구현됨)
2. Discord Bot이 스레드 생성 및 URL 반환 (향후 구현)
3. `discordThreadUrl` 필드에 저장

**현재 구현:**
- 실패 생성 시 Discord Webhook으로 텍스트 메시지 전송
- `discordThreadUrl` 필드는 있으나, 실제 Discord Thread 생성은 미구현

**향후 구현 방향:**
1. Discord Bot 설정
2. Webhook 응답에서 Thread ID 추출
3. Thread URL 생성 및 DB 저장
4. 프론트엔드에서 Thread URL로 링크

---

## 5. 컴포넌트 레벨 IA

### 5.1 컴포넌트 구조

```
/components
├── Layout/
│   └── Navbar.tsx              # 상단 네비게이션 바
│
├── Home/
│   ├── HeroSection.tsx         # 홈 히어로 섹션
│   ├── FilterBar.tsx           # 필터/탭 바
│   └── FailureCard.tsx         # 실패 카드 (그리드용)
│
├── Failures/
│   ├── FailureCardCarousel.tsx  # 가로 카드 캐러셀
│   └── FailureDetail.tsx       # 실패 상세 컴포넌트 (향후)
│
├── AI/
│   ├── EmotionChatLauncher.tsx # 플로팅 런처 버튼
│   └── ChatPanel.tsx           # 채팅 사이드 패널
│
└── Common/
    ├── TagPill.tsx             # 태그 pill 컴포넌트 (향후)
    ├── DiscordLinkBadge.tsx     # Discord 링크 배지 (향후)
    └── LoadingSpinner.tsx      # 로딩 스피너 (향후)
```

### 5.2 컴포넌트 상세

#### Layout

##### Navbar
**역할:** 상단 네비게이션 바 (모든 페이지 공통)

**Props:**
```typescript
// 현재는 props 없음 (정적 컴포넌트)
```

**기능:**
- Reloop 로고 (홈 링크)
- "실패 목록" 링크
- "실패 공유하기" 버튼

**파일:** `components/Navbar.tsx`

#### Home

##### HeroSection
**역할:** 홈 페이지 히어로 섹션

**Props:**
```typescript
// 현재는 props 없음 (정적 컴포넌트)
```

**기능:**
- 큰 제목 및 설명
- CTA 버튼 3개
- 우측 프리뷰 박스 (데스크탑)

**파일:** `components/HeroSection.tsx`

##### FilterBar
**역할:** 카테고리/감정 필터 및 검색 바

**Props:**
```typescript
{
  selectedCategory: string
  selectedEmotion: string
  searchQuery: string
  onCategoryChange: (category: string) => void
  onEmotionChange: (emotion: string) => void
  onSearchChange: (query: string) => void
}
```

**기능:**
- 카테고리 탭 버튼들
- 감정 태그 필터 버튼들
- 검색 인풋
- Sticky 상단 고정

**파일:** `components/FilterBar.tsx`

##### FailureCard
**역할:** 실패 카드 (그리드 레이아웃용)

**Props:**
```typescript
{
  failure: Failure
  discordThreadUrl?: string
}
```

**기능:**
- 썸네일 이미지 표시
- 제목, 요약 표시
- 카테고리/감정 태그 pill
- 메타 정보 (작성자, 날짜)
- AI/Discord 아이콘 표시
- 클릭 시 상세 페이지 이동

**파일:** `components/FailureCard.tsx`

#### Failures

##### FailureCardCarousel
**역할:** 가로 스크롤 카드 캐러셀 (Fuckup Nights 스타일)

**Props:**
```typescript
{
  failures: Failure[]
}
```

**기능:**
- 가로 스크롤 가능한 카드 리스트
- 좌우 화살표 버튼 (데스크탑)
- 반응형 (모바일 1장, 태블릿 2장, 데스크탑 3-4장)
- 스냅 스크롤

**파일:** `components/FailureCardCarousel.tsx`

#### AI

##### EmotionChatLauncher
**역할:** AI 채팅 플로팅 런처 버튼

**Props:**
```typescript
{
  failureSummary?: string
  emotionTag?: string
}
```

**기능:**
- 우하단 플로팅 버튼
- 클릭 시 ChatPanel 열기
- 실패 컨텍스트 전달

**파일:** `components/EmotionChatLauncher.tsx`

##### ChatPanel
**역할:** AI 채팅 사이드 패널

**Props:**
```typescript
{
  isOpen: boolean
  onClose: () => void
  failureSummary?: string
  emotionTag?: string
}
```

**기능:**
- 오른쪽에서 슬라이드 인되는 패널
- 채팅 메시지 표시 (사용자/AI)
- 메시지 입력 및 전송
- 로딩 상태 표시
- 에러 처리
- 반응형 (모바일 전체 화면, 데스크탑 사이드 패널)

**파일:** `components/ChatPanel.tsx`

#### Common (향후 구현)

##### TagPill
**역할:** 재사용 가능한 태그 pill 컴포넌트

**Props:**
```typescript
{
  label: string
  color?: 'blue' | 'gold' | 'silver'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}
```

**파일:** `components/common/TagPill.tsx` (향후)

##### DiscordLinkBadge
**역할:** Discord 링크 배지

**Props:**
```typescript
{
  threadUrl?: string
  serverInviteUrl?: string
  onClick?: () => void
}
```

**파일:** `components/common/DiscordLinkBadge.tsx` (향후)

##### LoadingSpinner
**역할:** 로딩 스피너

**Props:**
```typescript
{
  size?: 'sm' | 'md' | 'lg'
  color?: string
}
```

**파일:** `components/common/LoadingSpinner.tsx` (향후)

---

## 6. 데이터 흐름

### 6.1 데이터 페칭 전략

**서버 컴포넌트:**
- `/failures` - DB에서 직접 조회 (`getAllFailures`)
- `/failures/[id]` - DB에서 직접 조회 (`getFailureById`)

**클라이언트 컴포넌트:**
- `/` - API 호출 (`/api/failures`) 후 클라이언트 사이드 필터링
- `/submit` - 폼 제출 시 API 호출

**이유:**
- 서버 컴포넌트: SEO 및 초기 로딩 성능 최적화
- 클라이언트 컴포넌트: 실시간 필터링 및 인터랙션

### 6.2 상태 관리

**현재:**
- React `useState` 사용 (로컬 상태)
- Props drilling (필요시)

**향후 확장 가능성:**
- Zustand 또는 Jotai (전역 상태)
- React Query (서버 상태 캐싱)

---

## 7. 향후 확장 계획

### 7.1 인증 시스템
- 사용자 로그인/회원가입
- 세션 관리
- User 엔티티와 Failure 연결

### 7.2 Discord Bot 연동
- 실패 생성 시 자동 Thread 생성
- Thread URL 저장 및 링크

### 7.3 AI 기능 확장
- 실패 작성 시 AI 정리 요청
- AI 요약 자동 생성
- 감정 분석 결과 저장

### 7.4 소셜 기능
- 좋아요/북마크
- 댓글 시스템
- 팔로우/팔로워

### 7.5 검색 및 필터링 고도화
- 고급 필터 (날짜, 작성자 등)
- 정렬 옵션
- 태그 클라우드

---

## 8. 기술 스택 요약

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** 메모리 기반 (향후 PostgreSQL/MongoDB)
- **AI:** OpenAI API (gpt-4o-mini)
- **External:** Discord Webhook

---

## 9. 참고 문서

- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Discord Webhook 문서](https://discord.com/developers/docs/resources/webhook)

---

**문서 버전:** 1.0  
**최종 업데이트:** 2024-12-03  
**작성자:** Reloop Development Team




