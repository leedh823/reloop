# Reloop Flutter WebView App

Flutter로 만든 WebView 앱으로 Next.js 웹 앱을 Android/iOS에서 실행합니다.

## 사전 요구사항

1. **Flutter 설치**
   ```bash
   # Flutter 설치 확인
   flutter --version
   
   # 설치되어 있지 않다면
   # https://docs.flutter.dev/get-started/install/macos 에서 설치
   ```

2. **개발 서버 실행**
   ```bash
   cd /Users/idohyeong/Desktop/reloop-prt
   npm run dev
   ```

## Android Studio에서 실행

1. **프로젝트 열기**
   - Android Studio에서 `flutter_webview` 폴더 열기
   - Flutter 플러그인이 설치되어 있어야 합니다

2. **에뮬레이터 실행**
   - Android Studio의 Device Manager에서 에뮬레이터 실행
   - 또는 터미널에서: `flutter emulators --launch <emulator_name>`

3. **앱 실행**
   - Android Studio에서 Run 버튼 클릭
   - 또는 터미널에서: `flutter run`

## 터미널에서 실행

```bash
cd /Users/idohyeong/Desktop/reloop-prt/flutter_webview

# 에뮬레이터 목록 확인
flutter devices

# 앱 실행
flutter run
```

## URL 변경

`lib/main.dart` 파일에서 URL을 변경할 수 있습니다:

```dart
..loadRequest(Uri.parse('http://10.0.2.2:3000'));  // 에뮬레이터용
// 또는
..loadRequest(Uri.parse('http://192.168.0.100:3000'));  // 실제 기기용
```

## 문제 해결

- **Flutter가 설치되어 있지 않은 경우:**
  - https://docs.flutter.dev/get-started/install/macos 에서 설치
  - 또는 `brew install --cask flutter` (Homebrew 사용 시)

- **에뮬레이터가 보이지 않는 경우:**
  - Android Studio의 Device Manager에서 에뮬레이터 실행
  - `flutter emulators` 명령으로 사용 가능한 에뮬레이터 확인

- **개발 서버 연결 실패:**
  - `npm run dev`가 실행 중인지 확인
  - 에뮬레이터는 `10.0.2.2`를 사용
  - 실제 기기는 로컬 네트워크 IP 사용

