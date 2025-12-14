# Android Studio Device Mirroring 가이드

Android Studio의 Device Mirroring 기능을 사용하여 에뮬레이터나 실제 기기의 화면을 미러링할 수 있습니다.

## 방법 1: 에뮬레이터에서 Chrome 브라우저로 열기 (가장 간단)

### 1단계: 에뮬레이터 실행
1. Android Studio의 **"Running Devices"** 화면에서 **+** 버튼 클릭
2. 에뮬레이터 선택 (예: Pixel_9)
3. 에뮬레이터가 실행될 때까지 대기

### 2단계: Chrome 브라우저 열기
1. 에뮬레이터에서 Chrome 앱 실행
2. 주소창에 입력: `http://10.0.2.2:3000`
   - 참고: Android Emulator에서 `10.0.2.2`는 호스트 머신의 `localhost`를 의미합니다
3. Reloop 앱이 표시됩니다!

### 3단계: 개발 서버 확인
다른 터미널에서 개발 서버가 실행 중인지 확인:
```bash
cd /Users/idohyeong/Desktop/reloop-prt
npm run dev
```

---

## 방법 2: Device Mirroring 사용 (화면 미러링)

### 1단계: 에뮬레이터 실행
- Android Studio의 "Running Devices"에서 에뮬레이터 실행

### 2단계: Device Mirroring 활성화
1. Android Studio 우측 사이드바에서 **모니터 아이콘** 클릭
2. 또는 `View` → `Tool Windows` → `Device Mirroring`
3. 에뮬레이터 화면이 Android Studio 내부에 미러링됩니다

### 3단계: Chrome에서 웹 앱 열기
- 미러링된 화면에서 Chrome을 열고 `http://10.0.2.2:3000` 접속

---

## 방법 3: 실제 기기 연결 (USB 또는 WiFi)

### USB 연결
1. **USB 케이블로 기기 연결**
2. **개발자 옵션 활성화:**
   - 설정 → 휴대전화 정보 → 빌드 번호 7번 탭
3. **USB 디버깅 활성화:**
   - 설정 → 개발자 옵션 → USB 디버깅 켜기
4. **Android Studio에서 기기 인식:**
   - "Running Devices"에서 + 버튼 클릭
   - 연결된 기기가 목록에 표시됩니다

### WiFi 연결
1. **같은 WiFi 네트워크에 연결**
2. **USB로 먼저 연결하여 WiFi 디버깅 활성화**
3. **Android Studio에서 WiFi 디버깅 설정**

### 실제 기기에서 웹 앱 접속
- Chrome 브라우저에서 로컬 IP 주소 입력:
  ```bash
  # 로컬 IP 확인 (Mac)
  ipconfig getifaddr en0
  
  # 예: http://192.168.0.100:3000
  ```

---

## 문제 해결

### 에뮬레이터가 보이지 않는 경우
1. Android Studio → `Tools` → `Device Manager`
2. 에뮬레이터 생성 또는 실행

### Chrome에서 접속이 안 되는 경우
1. 개발 서버가 실행 중인지 확인: `npm run dev`
2. 에뮬레이터는 `10.0.2.2:3000` 사용
3. 실제 기기는 로컬 네트워크 IP 사용

### Device Mirroring이 작동하지 않는 경우
1. Android Studio 재시작
2. 에뮬레이터 재시작
3. `View` → `Tool Windows` → `Device Mirroring` 다시 열기

---

## 추천 방법

**가장 빠르고 간단한 방법:**
1. 에뮬레이터 실행 (Running Devices에서 + 클릭)
2. 에뮬레이터에서 Chrome 열기
3. `http://10.0.2.2:3000` 접속
4. Android Studio 우측 사이드바의 모니터 아이콘으로 화면 미러링

이렇게 하면 Android Studio에서 에뮬레이터 화면을 보면서 개발할 수 있습니다!

