# Reloop 모바일 퍼스트 반응형 가이드

## 1. 프로젝트 구조 분석

### 페이지별 컴포넌트 구조

#### 📱 홈 페이지 (`/app/page.tsx`)
- **HeroSection**: 히어로 섹션 (제목, 설명, CTA 버튼 3개)
- **SearchBar**: 검색바 (단독 섹션)
- **FilterWrapper**: 필터 래퍼 (카테고리 + 감정 필터)
  - CategoryFilter
  - EmotionFilter
- **FailureCard**: 실패 카드 (그리드 아이템)
- **EmptyState**: 빈 상태 메시지

#### 📋 실패 목록 페이지 (`/app/failures/page.tsx`)
- FailureCardCarousel (가로 스크롤 캐러셀)

#### 📄 실패 상세 페이지 (`/app/failures/[id]/page.tsx`)
- EmotionChatLauncher (플로팅 버튼)
- 상세 내용 표시

#### ✍️ 실패 공유 페이지 (`/app/submit/page.tsx`)
- 폼 필드들 (제목, 요약, 내용, 카테고리, 감정 태그)
- PDF 파일 업로드

#### 🤖 AI 분석 페이지 (`/app/ai/page.tsx`)
- FileUploadPanel: 파일 업로드 영역
- AnalysisResultPanel: 분석 결과 표시
- FileChatPanel: 파일 기반 채팅 패널

### 공통 컴포넌트
- **Layout/Navbar**: 상단 네비게이션 (햄버거 메뉴 포함)
- **UI/Button**: 버튼 컴포넌트 (Primary, Secondary, Link 버전)

---

## 2. 모바일 퍼스트 스타일 가이드

### 2.1 브레이크포인트 전략

```css
/* 모바일 퍼스트 접근 */
기본 (375px~): 모바일 스타일
sm (640px): 작은 태블릿/큰 모바일
md (768px): 태블릿
lg (1024px): 작은 데스크탑
xl (1280px): 데스크탑
2xl (1536px): 큰 데스크탑
```

**우선순위**: 모바일 → 태블릿 → 데스크탑 순으로 확장

### 2.2 헤더/네비게이션 구조

#### 모바일 (기본)
- **높이**: `h-14` (56px) - 터치 타겟 고려
- **패딩**: `px-4` (좌우 16px)
- **로고**: `text-xl` (20px)
- **햄버거 메뉴**: 우측 상단, `w-6 h-6` 아이콘
- **모바일 메뉴**: 
  - 전체 화면 오버레이 또는 하단에서 슬라이드 업
  - 배경: `bg-black/95 backdrop-blur-sm`
  - 메뉴 항목: `py-3` (터치 타겟 최소 44px)
  - 버튼: `w-full` (전체 너비)

#### 태블릿 이상 (md:)
- **높이**: `h-16` (64px)
- **패딩**: `px-6` (좌우 24px)
- **로고**: `text-2xl` (24px)
- **메뉴**: 가로 배치, `space-x-6`
- **버튼**: 인라인 스타일

### 2.3 기본 그리드/간격 시스템

#### 컨테이너
```tsx
// 모바일: 전체 너비, 좌우 패딩만
className="w-full px-4"

// 태블릿: 중앙 정렬, 좌우 패딩 증가
className="w-full max-w-2xl mx-auto px-6"

// 데스크탑: 최대 너비 제한
className="w-full max-w-7xl mx-auto px-8"
```

#### 간격 시스템
- **섹션 간격**: `py-8 md:py-12 lg:py-16`
- **컴포넌트 간격**: `space-y-4 md:space-y-6`
- **그리드 갭**: `gap-4 md:gap-6 lg:gap-8`
- **카드 간격**: `gap-4 md:gap-6`

#### 최대 너비 (한국어 가독성)
- **본문 텍스트**: `max-w-2xl` (672px) - 라인 길이 제한
- **제목**: `max-w-3xl` (768px)
- **컨테이너**: `max-w-7xl` (1280px)

### 2.4 타이포그래피

#### 모바일
- **H1**: `text-3xl` (30px), `leading-tight` (1.25)
- **H2**: `text-2xl` (24px), `leading-tight`
- **본문**: `text-base` (16px), `leading-relaxed` (1.625)
- **작은 텍스트**: `text-sm` (14px), `leading-normal` (1.5)

#### 태블릿 이상
- **H1**: `md:text-4xl lg:text-5xl` (36px → 48px)
- **H2**: `md:text-3xl lg:text-4xl` (30px → 36px)
- **본문**: `md:text-lg` (18px)

#### 라인 높이
- **제목**: `leading-tight` (1.25) - 컴팩트
- **본문**: `leading-relaxed` (1.625) - 가독성
- **한국어 최적화**: `max-w-2xl`로 라인 길이 제한

### 2.5 버튼 스타일

#### 모바일
- **높이**: 최소 `h-12` (48px) - 터치 타겟
- **패딩**: `px-6 py-3`
- **폰트**: `text-base font-semibold`
- **전체 너비**: `w-full` (모바일에서는 버튼을 전체 너비로)
- **간격**: `gap-3` (버튼 간 12px)

#### 태블릿 이상
- **높이**: `h-auto` (패딩으로 조절)
- **패딩**: `px-6 py-3 md:px-8 md:py-4`
- **전체 너비**: `md:w-auto` (인라인)
- **간격**: `md:gap-4`

#### 상태
- **기본**: `bg-reloop-blue text-white`
- **Hover**: `hover:bg-blue-600` (md 이상)
- **Focus**: `focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:ring-offset-2`
- **Disabled**: `opacity-50 cursor-not-allowed`

### 2.6 카드 스타일

#### 모바일
- **패딩**: `p-4`
- **간격**: `gap-4`
- **그리드**: `grid-cols-1` (1열)
- **둥근 모서리**: `rounded-lg` (8px)

#### 태블릿
- **패딩**: `md:p-6`
- **그리드**: `md:grid-cols-2` (2열)

#### 데스크탑
- **그리드**: `lg:grid-cols-3 xl:grid-cols-4`
- **간격**: `lg:gap-6`

### 2.7 폼 필드 스타일

#### 모바일
- **높이**: `h-12` (48px) - 터치 타겟
- **패딩**: `px-4 py-3`
- **폰트**: `text-base` (16px) - iOS 줌 방지
- **라벨**: `text-sm font-medium mb-2`
- **간격**: `space-y-4`

#### 태블릿 이상
- **높이**: `md:h-14`
- **패딩**: `md:px-6 md:py-4`

#### 상태
- **기본**: `bg-[#111] border border-[#2A2A2A]`
- **Focus**: `focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:border-transparent`
- **Placeholder**: `placeholder:text-[#7A7A7A]`

### 2.8 필터/태그 Pill 스타일

#### 모바일
- **높이**: `h-9` (36px)
- **패딩**: `px-4 py-2`
- **폰트**: `text-sm`
- **스크롤**: `overflow-x-auto` (가로 스크롤)
- **스냅**: `snap-x snap-mandatory` (선택적)

#### 태블릿 이상
- **높이**: `md:h-10`
- **패딩**: `md:px-5 md:py-2.5`

### 2.9 검색바 스타일

#### 모바일
- **높이**: `h-12` (48px)
- **패딩**: `px-4 pl-12` (아이콘 공간)
- **아이콘**: `left-4` (16px)
- **전체 너비**: `w-full`
- **간격**: `mb-4` (하단 여백)

#### 태블릿 이상
- **높이**: `md:h-14`
- **최대 너비**: `md:max-w-2xl` (중앙 정렬)
- **패딩**: `md:px-6 md:pl-14`

### 2.10 반응형 유틸리티 클래스

```tsx
// 모바일 퍼스트 패턴
className="
  // 모바일 (기본)
  text-base px-4 py-3
  // 태블릿
  md:text-lg md:px-6 md:py-4
  // 데스크탑
  lg:text-xl lg:px-8 lg:py-5
"

// 그리드 패턴
className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4 md:gap-6 lg:gap-8
"

// 숨김/표시 패턴
className="
  hidden md:block  // 모바일 숨김, 태블릿 이상 표시
  md:hidden        // 모바일 표시, 태블릿 이상 숨김
"
```

---

## 3. 수정 계획

### Phase 1: 공통 컴포넌트 (기반 작업)

#### 1.1 Navbar 모바일 최적화
**파일**: `components/Layout/Navbar.tsx`
**프롬프트**: 
```
Navbar를 모바일 퍼스트로 리팩토링:
- 모바일: h-14, px-4, text-xl 로고, 햄버거 메뉴 개선
- 모바일 메뉴: 전체 화면 오버레이 또는 슬라이드 업 애니메이션
- 태블릿 이상: h-16, px-6, text-2xl, 가로 메뉴
- 터치 타겟 최소 44px 보장
```

#### 1.2 Button 컴포넌트 모바일 최적화
**파일**: `components/UI/Button.tsx`
**프롬프트**:
```
Button 컴포넌트를 모바일 퍼스트로 수정:
- 모바일: h-12, px-6 py-3, text-base, w-full (기본)
- 태블릿: md:h-auto, md:px-8 md:py-4, md:w-auto
- focus 상태 개선 (ring-2 ring-reloop-blue)
- 터치 타겟 최소 44px 보장
```

### Phase 2: 홈 페이지

#### 2.1 HeroSection 모바일 퍼스트
**파일**: `components/Home/HeroSection.tsx`
**프롬프트**:
```
HeroSection을 모바일 퍼스트로 리팩토링:
- 모바일: text-3xl 제목, py-12, px-4, space-y-6
- 버튼 그룹: flex-col, gap-3, w-full (모바일)
- 태블릿: md:text-4xl, md:py-16, md:px-6, md:flex-row
- 데스크탑: lg:text-5xl, lg:py-24, lg:grid-cols-2
- 프리뷰 박스: lg:block (데스크탑만 표시)
- 본문 텍스트 max-w-2xl로 라인 길이 제한
```

#### 2.2 SearchBar 모바일 최적화
**파일**: `components/Home/SearchBar.tsx`
**프롬프트**:
```
SearchBar를 모바일 퍼스트로 수정:
- 모바일: h-12, px-4 pl-12, w-full, mb-4
- 태블릿: md:h-14, md:px-6 md:pl-14, md:max-w-2xl md:mx-auto
- 아이콘 위치 조정 (left-4 → md:left-6)
- 중앙 정렬 (태블릿 이상)
```

#### 2.3 FilterWrapper 모바일 최적화
**파일**: `components/Home/FilterWrapper.tsx`
**프롬프트**:
```
FilterWrapper를 모바일 퍼스트로 수정:
- 모바일: px-4, py-4, space-y-3
- 태블릿: md:px-6, md:py-6, md:space-y-4
- 필터 간격 조정
```

#### 2.4 CategoryFilter & EmotionFilter 모바일 최적화
**파일**: 
- `components/Home/CategoryFilter.tsx`
- `components/Home/EmotionFilter.tsx`
- `components/Home/FilterPillList.tsx`
**프롬프트**:
```
필터 Pill 컴포넌트를 모바일 퍼스트로 수정:
- 모바일: h-9, px-4 py-2, text-sm, overflow-x-auto
- 태블릿: md:h-10, md:px-5 md:py-2.5
- 가로 스크롤 개선 (snap-x, scrollbar-hide)
- 터치 스와이프 최적화
```

#### 2.5 FailureCard 모바일 최적화
**파일**: `components/Home/FailureCard.tsx`
**프롬프트**:
```
FailureCard를 모바일 퍼스트로 수정:
- 모바일: p-4, gap-3, text-sm
- 태블릿: md:p-6, md:gap-4, md:text-base
- 이미지 비율 유지 (aspect-ratio)
- 터치 타겟 최소 44px
```

#### 2.6 홈 페이지 레이아웃 조정
**파일**: `app/page.tsx`
**프롬프트**:
```
홈 페이지 레이아웃을 모바일 퍼스트로 수정:
- 섹션 간격: py-8 md:py-12
- 컨테이너: px-4 md:px-6 lg:px-8
- 그리드: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- 갭: gap-4 md:gap-6
- 최대 너비: max-w-7xl
```

### Phase 3: 실패 목록/상세 페이지

#### 3.1 실패 목록 페이지
**파일**: `app/failures/page.tsx`
**프롬프트**:
```
실패 목록 페이지를 모바일 퍼스트로 수정:
- 모바일: px-4, py-8, grid-cols-1
- 태블릿: md:px-6, md:py-12, md:grid-cols-2
- 데스크탑: lg:grid-cols-3, xl:grid-cols-4
```

#### 3.2 실패 상세 페이지
**파일**: `app/failures/[id]/page.tsx`
**프롬프트**:
```
실패 상세 페이지를 모바일 퍼스트로 수정:
- 모바일: px-4, py-8, text-base, max-w-2xl (본문)
- 태블릿: md:px-6, md:py-12, md:text-lg
- 데스크탑: lg:px-8, lg:py-16
- 본문 라인 길이 제한 (가독성)
```

### Phase 4: 실패 공유 페이지

#### 4.1 Submit 페이지 폼
**파일**: `app/submit/page.tsx`
**프롬프트**:
```
Submit 페이지를 모바일 퍼스트로 수정:
- 모바일: px-4, py-8, space-y-4
- 폼 필드: h-12, px-4 py-3, text-base (iOS 줌 방지)
- 태블릿: md:px-6, md:py-12, md:space-y-6
- 폼 필드: md:h-14, md:px-6 md:py-4
- 그리드: grid-cols-1 md:grid-cols-2 (2열 레이아웃)
- 버튼: w-full md:w-auto
```

### Phase 5: AI 분석 페이지

#### 5.1 AI 페이지 레이아웃
**파일**: `app/ai/page.tsx`
**프롬프트**:
```
AI 분석 페이지를 모바일 퍼스트로 수정:
- 모바일: px-4, py-8, space-y-6
- 태블릿: md:px-6, md:py-12, md:space-y-8
- 데스크탑: lg:px-8, lg:py-16
- 그리드: grid-cols-1 lg:grid-cols-2 (분석 결과 + 채팅)
- 파일 업로드 영역 모바일 최적화
```

#### 5.2 FileUploadPanel 모바일 최적화
**파일**: `components/AI/FileUploadPanel.tsx`
**프롬프트**:
```
FileUploadPanel을 모바일 퍼스트로 수정:
- 모바일: p-4, text-sm
- 태블릿: md:p-6, md:text-base
- 드래그 앤 드롭 영역 터치 최적화
```

#### 5.3 ChatPanel 모바일 최적화
**파일**: `components/AI/ChatPanel.tsx`
**프롬프트**:
```
ChatPanel을 모바일 퍼스트로 수정:
- 모바일: 전체 화면 오버레이 또는 하단 시트
- 태블릿: md:사이드 패널 (우측)
- 입력 필드: h-12, px-4 py-3 (터치 타겟)
- 메시지 버블: 모바일 최적화된 패딩/간격
```

---

## 4. 실행 순서

1. **Phase 1**: 공통 컴포넌트 (Navbar, Button)
2. **Phase 2**: 홈 페이지 (HeroSection → SearchBar → Filter → Card → Layout)
3. **Phase 3**: 실패 목록/상세 페이지
4. **Phase 4**: 실패 공유 페이지
5. **Phase 5**: AI 분석 페이지

각 Phase는 독립적으로 테스트 가능하며, 순차적으로 진행합니다.

---

## 5. 체크리스트

### 모바일 (375px~)
- [ ] 모든 터치 타겟 최소 44px
- [ ] 폰트 크기 최소 16px (iOS 줌 방지)
- [ ] 가로 스크롤 없음 (필터 제외)
- [ ] 버튼 전체 너비 (모바일)
- [ ] 적절한 패딩/간격 (px-4, gap-4)

### 태블릿 (768px~)
- [ ] 2열 그리드 적용
- [ ] 버튼 인라인 배치
- [ ] 패딩 증가 (px-6)
- [ ] 폰트 크기 증가

### 데스크탑 (1024px~)
- [ ] 3-4열 그리드
- [ ] 최대 너비 제한
- [ ] 본문 라인 길이 제한 (max-w-2xl)
- [ ] 호버 상태 적용



