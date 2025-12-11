# Supabase 백엔드 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL (예: `https://xxxxx.supabase.co`)
   - Anon Key
   - Service Role Key (서버 사이드용)

## 2. 환경 변수 설정

### Vercel 환경 변수

다음 환경 변수를 Vercel에 추가:

**프로젝트 참조 ID가 `xwekiffneeprrukrxhqi`인 경우:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xwekiffneeprrukrxhqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
USE_SUPABASE_EDGE_FUNCTIONS=true
OPENAI_API_KEY=your-openai-api-key
```

**Supabase 대시보드에서 키 확인 방법:**
1. Supabase 프로젝트 대시보드 접속
2. Settings → API 메뉴
3. 다음 키들을 복사:
   - **Project URL**: `https://xwekiffneeprrukrxhqi.supabase.co` (이미 알고 있음)
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`와 `SUPABASE_ANON_KEY`에 사용
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY`에 사용 (비밀 유지!)

### Supabase Edge Functions Secrets

Supabase 대시보드에서 Edge Functions Secrets 설정:

1. 프로젝트 → Edge Functions → Secrets
2. 다음 Secret 추가:
   - `OPENAI_API_KEY`: OpenAI API 키

또는 Supabase CLI 사용:

```bash
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

## 3. Supabase CLI 설치 및 배포

### CLI 설치

```bash
npm install -g supabase
```

### 로그인

```bash
supabase login
```

### 프로젝트 연결

```bash
supabase link --project-ref your-project-ref
```

### Edge Functions 배포

```bash
# 모든 함수 배포
supabase functions deploy

# 개별 함수 배포
supabase functions deploy openai-analyze-file
supabase functions deploy openai-emotion-reflect
supabase functions deploy openai-chat-with-file
```

## 4. 로컬 개발

### Supabase 로컬 실행

```bash
supabase start
```

### Edge Functions 로컬 테스트

```bash
supabase functions serve openai-analyze-file
```

## 5. 장점

- **보안**: API 키가 클라이언트에 노출되지 않음
- **안정성**: Supabase Edge Functions는 Deno 런타임에서 실행되어 더 안정적
- **확장성**: Supabase의 인프라를 활용하여 자동 스케일링
- **403 오류 해결**: Vercel의 서버리스 함수 제한을 우회

## 6. 문제 해결

### Edge Functions가 403 오류를 반환하는 경우

1. Supabase 프로젝트의 CORS 설정 확인
2. `SUPABASE_ANON_KEY`가 올바르게 설정되었는지 확인
3. Edge Functions의 Secrets에 `OPENAI_API_KEY`가 설정되었는지 확인

### 기존 Next.js API Routes로 폴백

`USE_SUPABASE_EDGE_FUNCTIONS=false`로 설정하거나 환경 변수를 제거하면 기존 Next.js API Routes를 사용합니다.

