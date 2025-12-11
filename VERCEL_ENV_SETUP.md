# Vercel 환경 변수 설정 가이드

## 현재 설정된 변수

✅ `NEXT_PUBLIC_SUPABASE_URL=https://xwekiffneeprrukrxhqi.supabase.co`
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 추가로 필요한 환경 변수

### 1. Supabase Edge Functions 활성화

```
USE_SUPABASE_EDGE_FUNCTIONS=true
```

이 변수를 `true`로 설정하면 Supabase Edge Functions를 사용합니다.
설정하지 않거나 `false`이면 기존 Next.js API Routes를 사용합니다.

### 2. 서버 사이드용 Anon Key (선택사항)

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**참고**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`와 같은 값입니다. 
코드에서 자동으로 폴백하므로 설정하지 않아도 작동하지만, 명시적으로 설정하는 것을 권장합니다.

### 3. OpenAI API Key

```
OPENAI_API_KEY=sk-...
```

이미 설정되어 있을 수 있습니다. Supabase Edge Functions에서도 사용됩니다.

### 4. Service Role Key (선택사항, 향후 사용)

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

현재는 사용하지 않지만, 향후 데이터베이스 작업 시 필요할 수 있습니다.

## Supabase Edge Functions Secrets 설정

Supabase 대시보드에서 Edge Functions Secrets에 `OPENAI_API_KEY`를 설정해야 합니다:

1. Supabase 프로젝트 대시보드 접속
2. **Edge Functions** → **Secrets** 메뉴
3. 다음 Secret 추가:
   - Key: `OPENAI_API_KEY`
   - Value: OpenAI API 키 (sk-...로 시작)

또는 Supabase CLI 사용:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-api-key-here --project-ref xwekiffneeprrukrxhqi
```

## 최종 환경 변수 목록

Vercel에 다음 환경 변수들을 모두 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://xwekiffneeprrukrxhqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NEXT_PUBLIC과 동일)
USE_SUPABASE_EDGE_FUNCTIONS=true
OPENAI_API_KEY=sk-...
```

## 다음 단계

1. ✅ 환경 변수 설정 완료
2. ⏳ Supabase Edge Functions 배포 필요
3. ⏳ Edge Functions Secrets에 OPENAI_API_KEY 설정 필요



