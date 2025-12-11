# 403 오류 해결 가이드

## 현재 상황

AI 분석 페이지에서 "OpenAI API 접근이 거부되었습니다" (403 오류)가 발생하고 있습니다.

## 가능한 원인

### 1. 환경 변수 미설정

Vercel에 다음 환경 변수가 설정되어 있는지 확인하세요:

```
OPENAI_API_KEY=sk-... (OpenAI API 키)
USE_SUPABASE_EDGE_FUNCTIONS=true (Supabase 사용 시)
NEXT_PUBLIC_SUPABASE_URL=https://xwekiffneeprrukrxhqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API 키 문제

- **API 키가 올바른지 확인**: `sk-`로 시작해야 합니다
- **API 키에 공백이 없는지 확인**: 앞뒤 공백 제거
- **API 키가 활성화되어 있는지 확인**: OpenAI 대시보드에서 확인
- **크레딧이 충분한지 확인**: OpenAI 대시보드에서 확인

### 3. Supabase Edge Functions 미배포

Supabase Edge Functions를 사용하려면:

1. **Edge Functions 배포**:
```bash
supabase functions deploy openai-analyze-file --project-ref xwekiffneeprrukrxhqi
supabase functions deploy openai-emotion-reflect --project-ref xwekiffneeprrukrxhqi
supabase functions deploy openai-chat-with-file --project-ref xwekiffneeprrukrxhqi
```

2. **Secrets 설정**:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here --project-ref xwekiffneeprrukrxhqi
```

또는 Supabase 대시보드에서:
- Edge Functions → Secrets → `OPENAI_API_KEY` 추가

### 4. Vercel 재배포 필요

환경 변수를 추가/수정한 후 **반드시 재배포**해야 합니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 환경 변수 확인/수정
3. Deployments → 최신 배포 → "Redeploy" 클릭

## 디버깅 방법

### 1. 환경 변수 확인

브라우저에서 다음 URL을 열어 확인:
```
https://reloop-beta.vercel.app/api/debug/env
```

다음 정보가 표시됩니다:
- `hasApiKey`: API 키 존재 여부
- `apiKeyLength`: API 키 길이
- `apiKeyPrefix`: API 키 앞 7자리
- `startsWithSk`: `sk-`로 시작하는지
- `useSupabaseEdgeFunctions`: Supabase 사용 여부

### 2. Vercel 로그 확인

Vercel 대시보드 → 프로젝트 → Deployments → 최신 배포 → Functions 탭

다음 로그를 확인하세요:
- `[analyze-file] 환경 변수 확인:`
- `[analyze-file] Supabase Edge Function 호출 시도` 또는 `[analyze-file] Next.js API Route 사용`
- `API Key 체크:`
- `OpenAI API 오류:`

### 3. Supabase Edge Functions 로그 확인

Supabase 대시보드 → Edge Functions → `openai-analyze-file` → Logs

## 해결 단계

### 옵션 1: Supabase Edge Functions 사용 (권장)

1. **Supabase Edge Functions 배포**:
```bash
# Supabase CLI 설치 (없다면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref xwekiffneeprrukrxhqi

# Edge Functions 배포
supabase functions deploy openai-analyze-file
supabase functions deploy openai-emotion-reflect
supabase functions deploy openai-chat-with-file

# Secrets 설정
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here
```

2. **Vercel 환경 변수 설정**:
```
USE_SUPABASE_EDGE_FUNCTIONS=true
NEXT_PUBLIC_SUPABASE_URL=https://xwekiffneeprrukrxhqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NEXT_PUBLIC과 동일)
```

3. **Vercel 재배포**

### 옵션 2: Next.js API Routes 직접 사용

1. **Vercel 환경 변수 설정**:
```
OPENAI_API_KEY=sk-your-api-key-here
USE_SUPABASE_EDGE_FUNCTIONS=false (또는 설정하지 않음)
```

2. **Vercel 재배포**

## 주의사항

- **PDF 파일**: 현재 Supabase Edge Functions는 PDF를 지원하지 않습니다. PDF 파일은 항상 Next.js API Routes를 통해 처리됩니다.
- **환경 변수 변경 후**: 반드시 Vercel 재배포가 필요합니다.
- **API 키 보안**: `OPENAI_API_KEY`는 절대 클라이언트에 노출되지 않도록 서버 사이드에서만 사용됩니다.

## 추가 확인 사항

1. **OpenAI 계정 상태**: OpenAI 대시보드에서 API 키가 활성화되어 있고 크레딧이 충분한지 확인
2. **Rate Limit**: 너무 많은 요청을 보내면 403이 발생할 수 있습니다. 잠시 후 다시 시도하세요.
3. **IP 제한**: OpenAI API 키에 IP 제한이 설정되어 있다면 Vercel/Supabase IP를 허용 목록에 추가해야 합니다.


