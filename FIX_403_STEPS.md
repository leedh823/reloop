# 403 오류 해결 단계별 가이드

## 🔴 현재 상황
- `/api/ai/analyze-file` 엔드포인트에서 403 Forbidden 오류 발생
- OpenAI API 접근이 거부되고 있음

## ✅ 즉시 확인해야 할 사항

### 1. Vercel 환경 변수 확인 (가장 중요!)

**Vercel 대시보드에서:**
1. https://vercel.com 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**

**확인할 변수:**
```
OPENAI_API_KEY=sk-... (반드시 있어야 함)
```

**없다면 추가:**
- **Key**: `OPENAI_API_KEY`
- **Value**: OpenAI API 키 (sk-로 시작)
- **Environment**: ✅ Production, ✅ Preview, ✅ Development 모두 체크
- **Save** 클릭

### 2. API 키 확인

**OpenAI 대시보드에서:**
1. https://platform.openai.com/api-keys 접속
2. API 키 목록 확인
3. 키가 **Active** 상태인지 확인
4. 키가 삭제되었거나 비활성화되었다면 새로 생성

**새 키 생성:**
1. "Create new secret key" 클릭
2. 키 이름 입력 (예: "Reloop Production")
3. 생성된 키 복사 (한 번만 보여줌!)
4. Vercel에 추가

### 3. 크레딧 확인

**OpenAI 대시보드에서:**
1. https://platform.openai.com/account/billing 접속
2. **Usage** 탭 확인
3. 크레딧이 충분한지 확인 (최소 $5 이상 권장)

### 4. Vercel 재배포 (필수!)

**환경 변수를 추가/수정했다면:**
1. Vercel 대시보드 → **Deployments**
2. 최신 배포 클릭
3. **"..." 메뉴** → **"Redeploy"**
4. 재배포 완료 대기 (1-2분)

### 5. Vercel 로그 확인

**재배포 후:**
1. Vercel 대시보드 → **Deployments** → 최신 배포
2. **Functions** 탭 클릭
3. `/api/ai/analyze-file` 함수 클릭
4. 로그에서 다음 확인:
   - `API Key 체크:` - `exists: true`, `startsWithSk: true` 여야 함
   - `OpenAI API 오류:` - 구체적인 오류 메시지 확인

## 🧪 테스트 방법

### 방법 1: 디버그 엔드포인트
```
https://reloop-beta.vercel.app/api/debug/env
```

확인할 내용:
- `hasApiKey: true`
- `startsWithSk: true`
- `apiKeyLength: 50 이상`

### 방법 2: OpenAI API 직접 테스트
```
https://reloop-beta.vercel.app/api/test-openai
```

이 엔드포인트는 OpenAI API에 직접 연결을 시도합니다.

## ❌ 여전히 안 된다면

### 가능한 원인들:

1. **API 키 형식 오류**
   - `sk-`로 시작해야 함
   - 앞뒤 공백 없어야 함
   - 전체 키가 복사되었는지 확인

2. **환경 변수 설정 오류**
   - Production, Preview, Development 모두 체크했는지
   - 변수 이름이 정확히 `OPENAI_API_KEY`인지 (대소문자 구분)
   - 재배포를 했는지

3. **OpenAI 계정 문제**
   - 계정이 정지되었는지
   - 결제 정보가 등록되어 있는지
   - 크레딧이 충분한지

4. **Rate Limit**
   - 너무 많은 요청을 보냈는지
   - 잠시 후 다시 시도

### 최종 해결 방법:

1. **새 API 키 발급**
   - OpenAI 대시보드에서 새 키 생성
   - Vercel에 새 키로 업데이트
   - 재배포

2. **Supabase Edge Functions 사용**
   - Supabase Edge Functions로 OpenAI API 호출을 위임
   - Vercel의 제한을 우회

## 📝 체크리스트

- [ ] Vercel에 `OPENAI_API_KEY` 환경 변수 설정
- [ ] 환경 변수에 Production, Preview, Development 모두 체크
- [ ] OpenAI 대시보드에서 API 키가 Active 상태인지 확인
- [ ] OpenAI 계정에 충분한 크레딧이 있는지 확인
- [ ] Vercel 재배포 완료
- [ ] `/api/debug/env`에서 `hasApiKey: true` 확인
- [ ] Vercel 로그에서 구체적인 오류 메시지 확인

## 🆘 도움이 필요하면

Vercel 로그의 다음 정보를 공유해주세요:
- `API Key 체크:` 로그
- `OpenAI API 오류:` 로그
- `/api/debug/env` 응답






