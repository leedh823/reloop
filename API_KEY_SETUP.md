# OpenAI API 키 설정 가이드

## 문제
현재 API 키가 플레이스홀더 값(`sk-your-api-key-here`)으로 설정되어 있어 OpenAI API 인증이 실패합니다.

## 해결 방법

### 1. OpenAI API 키 발급
1. https://platform.openai.com/api-keys 접속
2. 로그인 후 "Create new secret key" 클릭
3. API 키 복사 (한 번만 표시되므로 안전하게 보관)

### 2. 로컬 환경 변수 설정

`.env.local` 파일을 열고 다음을 수정하세요:

```bash
# 실제 API 키로 변경 (예시)
OPENAI_API_KEY=sk-실제발급받은API키를여기에붙여넣기
```

⚠️ **보안 주의**: API 키는 절대 공개 문서나 GitHub에 커밋하지 마세요!

### 3. 서버 재시작

환경 변수를 변경한 후 개발 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 4. API 키 확인

브라우저에서 다음 URL로 접속하여 API 키가 올바르게 설정되었는지 확인:

```
http://localhost:3000/api/debug/env
```

확인 사항:
- `hasApiKey`: `true`
- `apiKeyLength`: `51` 이상 (실제 API 키는 보통 51자 이상)
- `apiKeyPrefix`: `sk-proj...` 또는 `sk-`로 시작
- `startsWithSk`: `true`

### 5. Vercel 배포 시 환경 변수 설정

Vercel에 배포하는 경우:

1. Vercel 대시보드 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. `OPENAI_API_KEY` 추가
4. Value에 실제 API 키 입력
5. Environment: Production, Preview, Development 모두 선택
6. Save 후 재배포

## 주의사항

- ⚠️ API 키는 절대 공개하지 마세요
- ⚠️ `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- ⚠️ GitHub에 API 키를 커밋하지 마세요

## 문제 해결

### API 키를 설정했는데도 401 오류가 발생하는 경우:

1. **서버 재시작 확인**: 환경 변수 변경 후 반드시 서버를 재시작해야 합니다
2. **API 키 형식 확인**: `sk-`로 시작해야 합니다
3. **API 키 활성화 확인**: OpenAI 대시보드에서 API 키가 활성화되어 있는지 확인
4. **크레딧 확인**: OpenAI 계정에 충분한 크레딧이 있는지 확인

### 터미널에서 확인:

```bash
# API 키 길이 확인 (실제 키는 51자 이상)
curl -s http://localhost:3000/api/debug/env | grep apiKeyLength

# API 키 접두사 확인
curl -s http://localhost:3000/api/debug/env | grep apiKeyPrefix
```

