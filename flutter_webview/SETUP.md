# Flutter 프로젝트 설정 가이드

## 1. Flutter 설치

### 방법 1: 공식 사이트에서 설치 (권장)
1. https://docs.flutter.dev/get-started/install/macos 방문
2. Flutter SDK 다운로드 및 압축 해제
3. PATH에 Flutter 추가:
   ```bash
   export PATH="$PATH:[FLUTTER_SDK_PATH]/bin"
   ```
   또는 `~/.zshrc`에 추가:
   ```bash
   echo 'export PATH="$PATH:[FLUTTER_SDK_PATH]/bin"' >> ~/.zshrc
   source ~/.zshrc
   ```

### 방법 2: Homebrew로 설치
```bash
brew install --cask flutter
```

### 설치 확인
```bash
flutter --version
flutter doctor
```

## 2. Android Studio에서 Flutter 플러그인 설치

1. **Android Studio 열기**
2. **Preferences 열기** (Mac: `Cmd + ,`)
3. **Plugins** 선택
4. **"Flutter" 검색 후 설치**
   - Dart 플러그인도 자동으로 설치됩니다
5. **Android Studio 재시작**

## 3. 프로젝트 열기

1. Android Studio에서 `File` → `Open`
2. `flutter_webview` 폴더 선택
3. Android Studio가 자동으로 Flutter 프로젝트로 인식합니다

## 4. 의존성 설치

Android Studio에서:
- `pubspec.yaml` 파일을 열면 상단에 "Pub get" 버튼이 표시됩니다
- 클릭하여 의존성 설치

또는 터미널에서:
```bash
cd flutter_webview
flutter pub get
```

## 5. 에뮬레이터 실행

1. Android Studio 상단 툴바에서 에뮬레이터 선택
2. 또는 `Tools` → `Device Manager` → 에뮬레이터 실행

## 6. 앱 실행

1. Android Studio에서 `main.dart` 파일 열기
2. 상단 툴바의 녹색 **Run** 버튼 클릭
3. 또는 `Shift + F10` (Mac: `Ctrl + R`)

## 7. 개발 서버 실행

다른 터미널에서:
```bash
cd /Users/idohyeong/Desktop/reloop-prt
npm run dev
```

## 문제 해결

- **Flutter 명령어를 찾을 수 없는 경우:**
  - PATH 설정 확인
  - 터미널 재시작

- **Android Studio에서 Flutter 프로젝트로 인식되지 않는 경우:**
  - Flutter 플러그인 설치 확인
  - Android Studio 재시작

- **에뮬레이터가 보이지 않는 경우:**
  - `flutter doctor` 실행하여 문제 확인
  - Android SDK 설치 확인
