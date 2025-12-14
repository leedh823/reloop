# 📱 모바일 앱 설정 가이드

## PWA (Progressive Web App) 설정 완료

이제 Reloop를 모바일에서 앱처럼 사용할 수 있습니다!

## 🚀 모바일에서 접근하는 방법

### 방법 1: 로컬 네트워크에서 접근 (같은 Wi-Fi)

1. **개발 서버를 모바일 접근 가능하게 실행:**
   ```bash
   npm run dev:mobile
   ```

2. **로컬 IP 주소 확인:**
   - 터미널에 표시된 IP 주소를 확인하세요
   - 예: `http://192.168.0.100:3000`

3. **모바일 기기에서 접근:**
   - 같은 Wi-Fi에 연결된 모바일 기기에서
   - 브라우저로 위 주소를 입력하세요

4. **홈 화면에 추가:**
   - **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
   - **Android Chrome**: 메뉴 → "홈 화면에 추가" 또는 "앱 설치"

### 방법 2: Chrome DevTools를 통한 모바일 시뮬레이션

1. **개발 서버 실행:**
   ```bash
   npm run dev
   ```

2. **Chrome에서 개발자 도구 열기:**
   - `Cmd + Option + I` (Mac) 또는 `F12` (Windows)
   - 또는 우클릭 → "검사"

3. **디바이스 툴바 활성화:**
   - `Cmd + Shift + M` (Mac) 또는 `Ctrl + Shift + M` (Windows)
   - 또는 툴바의 디바이스 아이콘 클릭

4. **모바일 디바이스 선택:**
   - 상단 드롭다운에서 iPhone, iPad, Galaxy 등 선택
   - 또는 커스텀 디바이스 크기 설정

### 방법 3: 실제 모바일 기기에서 테스트 (USB 연결)

#### Android (Chrome DevTools)

1. **Android 기기에서 USB 디버깅 활성화:**
   - 설정 → 개발자 옵션 → USB 디버깅 활성화

2. **USB로 연결 후 Chrome에서:**
   - `chrome://inspect` 접속
   - 연결된 기기에서 "inspect" 클릭

#### iOS (Safari Web Inspector)

1. **iOS 기기에서 Safari 설정:**
   - 설정 → Safari → 고급 → 웹 검사기 활성화

2. **Mac Safari에서:**
   - 개발 → [기기명] → [웹페이지] 선택

## 📱 앱처럼 보이게 하는 설정

### 이미 적용된 설정:

✅ **PWA Manifest** (`/public/manifest.json`)
- 앱 이름, 아이콘, 테마 색상 설정
- 홈 화면에 추가 시 앱처럼 보임

✅ **Viewport 설정**
- 모바일 최적화된 뷰포트
- 확대/축소 비활성화 (앱처럼)

✅ **Theme Color**
- 상태바 색상 자동 조정
- 다크모드 지원

✅ **Apple Touch Icon**
- iOS에서 홈 화면 추가 시 아이콘 표시

## 🎨 추가 커스터마이징

### 아이콘 변경
- `/public/images/logo1.png` 파일을 원하는 아이콘으로 교체
- 권장 크기: 512x512px (PNG)

### 앱 이름 변경
- `/public/manifest.json`의 `name`과 `short_name` 수정
- `/app/layout.tsx`의 `metadata.title` 수정

## 🔍 테스트 체크리스트

- [ ] 모바일 브라우저에서 접근 가능
- [ ] 홈 화면에 추가 가능
- [ ] 홈 화면에서 실행 시 전체화면으로 표시
- [ ] 상태바 색상이 올바르게 표시
- [ ] 아이콘이 올바르게 표시
- [ ] 터치 제스처가 정상 작동
- [ ] 스크롤이 부드럽게 작동

## 🐛 문제 해결

### 모바일에서 접근이 안 될 때:
1. 방화벽 확인 (포트 3000 허용)
2. 같은 Wi-Fi 네트워크 확인
3. IP 주소가 올바른지 확인

### 홈 화면 추가가 안 될 때:
1. HTTPS 또는 localhost에서만 작동 (프로덕션 배포 시)
2. 브라우저가 PWA를 지원하는지 확인
3. manifest.json이 올바르게 로드되는지 확인

## 📚 참고 자료

- [Next.js PWA 가이드](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

