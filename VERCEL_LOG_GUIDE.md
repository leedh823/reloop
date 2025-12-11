# Vercel 함수 로그 확인 가이드

## 📍 함수 로그 위치

### 방법 1: Functions 탭 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 로그인 후 프로젝트 선택

2. **Functions 탭 클릭**
   - 프로젝트 대시보드 상단 메뉴에서 **"Functions"** 탭 클릭

3. **함수 선택**
   - 왼쪽 목록에서 `/api/ai/analyze-file` 함수 클릭
   - 또는 검색창에 `analyze-file` 입력

4. **로그 확인**
   - 함수 상세 페이지에서 실시간 로그 확인
   - 시간순으로 정렬된 로그 표시

### 방법 2: Deployments 탭

1. **Deployments 탭 클릭**
   - 프로젝트 대시보드에서 **"Deployments"** 탭 클릭

2. **최신 배포 선택**
   - 가장 최근 배포 클릭

3. **Functions 섹션 확인**
   - 배포 상세 페이지에서 **"Functions"** 섹션 찾기
   - `/api/ai/analyze-file` 함수 클릭

4. **로그 확인**
   - 함수 실행 로그 확인

## 🔍 로그에서 확인할 정보

### POST 요청 발생 시 확인할 로그:

```
[callOpenAIAPI] API 키 상태: { hasKey: true, keyPrefix: "sk-..." }
[callOpenAIAPI] 요청 정보: { baseURL: "...", model: "gpt-4o-mini", ... }
[callOpenAIAPI] 응답 상태: { status: 200/403, statusText: "...", ok: true/false }
```

### 403 오류 발생 시 확인할 로그:

```
[callOpenAIAPI] ❌ OpenAI API 오류: {
  status: 403,
  code: "invalid_api_key" (또는 다른 코드),
  type: "invalid_request_error",
  message: "...",
  responseBody: { ... }
}
```

## 🔎 로그 검색 팁

1. **검색창 사용**
   - Functions 페이지 상단 검색창에 `[callOpenAIAPI]` 입력
   - 또는 `[analyze-file]` 입력

2. **시간 필터**
   - 특정 시간대의 로그만 확인 가능

3. **실시간 로그**
   - POST 요청을 보낸 직후 로그 확인
   - 로그는 실시간으로 업데이트됨

## ⚠️ 로그가 안 보일 때

1. **함수가 실행되었는지 확인**
   - 실제로 POST 요청을 보냈는지 확인
   - GET 요청만 보내면 POST 관련 로그는 없음

2. **배포 상태 확인**
   - 최신 코드가 배포되었는지 확인
   - 배포가 완료되지 않았으면 이전 버전의 로그만 보임

3. **다른 함수 확인**
   - `/api/ai/emotion-reflect` 또는 `/api/ai/chat-with-file` 함수도 확인

## 📸 스크린샷 위치

Functions 탭에서:
- 왼쪽: 함수 목록
- 오른쪽: 선택한 함수의 상세 로그

로그는 다음과 같은 형식으로 표시됩니다:
```
[타임스탬프] [로그 레벨] [메시지]
예: [2024-12-12 00:20:16] [INFO] [callOpenAIAPI] API 키 상태: ...
```

