# Vercel 배포 가이드

## 필수 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 **반드시** 설정해야 합니다:

### 1. OpenAI API Key (필수)

1. Vercel 대시보드 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: 실제 OpenAI API 키 (sk-로 시작)
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 선택
4. **Save** 클릭
5. **Redeploy** 실행 (중요!)

### 2. 환경 변수 확인 방법

배포 후 다음 URL로 접속하여 환경 변수가 제대로 로드되었는지 확인:

```
https://your-project.vercel.app/api/debug/env
```

확인 사항:
- `hasApiKey`: `true`
- `apiKeyLength`: 51 이상
- `startsWithSk`: `true`

## Vercel 특화 설정

### 함수 타임아웃

현재 설정:
- Production: 60초
- Development: 120초

Vercel Pro 플랜에서는 최대 300초까지 가능합니다.

### Node.js Runtime

코드에서 이미 설정되어 있습니다:
```typescript
export const runtime = 'nodejs'
```

### pdf-parse 모듈

`next.config.js`에서 external로 설정되어 있어 Vercel에서도 정상 작동합니다.

## 문제 해결

### 1. API 키가 로드되지 않는 경우

**증상**: 401 또는 500 오류

**해결 방법**:
1. Vercel 대시보드에서 환경 변수 확인
2. 환경 변수 이름이 정확한지 확인 (`OPENAI_API_KEY`)
3. 모든 환경(Production, Preview, Development)에 설정되어 있는지 확인
4. **Redeploy** 실행 (환경 변수 변경 후 반드시 필요)

### 2. 함수 타임아웃 오류

**증상**: 504 Gateway Timeout

**해결 방법**:
- 큰 파일(20MB+)은 처리 시간이 오래 걸릴 수 있습니다
- Vercel Pro 플랜으로 업그레이드하여 타임아웃 증가
- 또는 파일 크기 제한을 낮춤

### 3. pdf-parse 모듈 오류

**증상**: "Cannot find module 'pdf-parse'"

**해결 방법**:
- `package.json`에 `pdf-parse`가 포함되어 있는지 확인
- Vercel 빌드 로그에서 모듈 설치 확인

## 배포 체크리스트

- [ ] `OPENAI_API_KEY` 환경 변수 설정 (모든 환경)
- [ ] 환경 변수 저장 후 **Redeploy** 실행
- [ ] `/api/debug/env` 엔드포인트로 환경 변수 확인
- [ ] Vercel 함수 로그 확인 (Functions 탭)
- [ ] 작은 파일로 먼저 테스트

## Vercel 함수 로그 확인

1. Vercel 대시보드 → 프로젝트 선택
2. **Functions** 탭 클릭
3. `/api/ai/analyze-file` 함수 선택
4. 로그에서 다음 확인:
   - `[analyze-file] 요청 시작`
   - `[analyze-file] pdf-parse 모듈 로드 완료`
   - `API Key 체크: { exists: true, ... }`
   - `OpenAI API 호출 준비`

오류가 발생하면 로그에 상세 정보가 표시됩니다.


