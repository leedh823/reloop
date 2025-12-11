# 403 오류 빠른 해결 가이드

## 🔍 1단계: 현재 상태 확인 (필수)

배포된 사이트에서 다음 URL을 열어보세요:
```
https://reloop-beta.vercel.app/api/debug/env
```

확인할 내용:
- `hasApiKey`: `true`여야 함
- `startsWithSk`: `true`여야 함
- `apiKeyLength`: 50자 이상이어야 함

## ✅ 2단계: Vercel 환경 변수 확인 및 설정

### Vercel 대시보드 접속
1. https://vercel.com 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭

### 필수 환경 변수 확인
다음 변수가 있는지 확인하세요:

```
OPENAI_API_KEY=sk-... (여기에 실제 API 키)
```

**없다면 추가:**
1. **Key**: `OPENAI_API_KEY`
2. **Value**: `sk-`로 시작하는 OpenAI API 키
3. **Environment**: Production, Preview, Development 모두 선택
4. **Save** 클릭

### API 키 확인 방법
- OpenAI 대시보드: https://platform.openai.com/api-keys
- 새 키 생성 또는 기존 키 확인

## 🚀 3단계: Vercel 재배포 (중요!)

환경 변수를 추가/수정했다면 **반드시 재배포**해야 합니다:

1. Vercel 대시보드 → **Deployments** 탭
2. 최신 배포 클릭
3. **"..." 메뉴** → **"Redeploy"** 클릭
4. 재배포 완료 대기 (1-2분)

## 🧪 4단계: 테스트

재배포 완료 후:
1. https://reloop-beta.vercel.app/ai 접속
2. PDF 파일 업로드
3. "AI 분석하기" 클릭
4. 오류가 사라졌는지 확인

## ❌ 여전히 403 오류가 발생한다면

### 추가 확인 사항

1. **API 키가 올바른지 확인**
   - OpenAI 대시보드에서 키가 활성화되어 있는지
   - `sk-`로 시작하는지
   - 앞뒤 공백이 없는지

2. **크레딧 확인**
   - OpenAI 대시보드 → Billing → Usage
   - 크레딧이 충분한지 확인

3. **Vercel 로그 확인**
   - Vercel 대시보드 → Deployments → Functions 탭
   - 에러 로그 확인

## 📝 체크리스트

- [ ] `/api/debug/env`에서 `hasApiKey: true` 확인
- [ ] Vercel에 `OPENAI_API_KEY` 환경 변수 설정
- [ ] 환경 변수에 Production, Preview, Development 모두 선택
- [ ] Vercel 재배포 완료
- [ ] 재배포 후 테스트

