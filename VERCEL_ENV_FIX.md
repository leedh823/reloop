# Vercel 환경 변수 설정 가이드 (403 오류 해결)

## 🔴 문제: 로컬에서는 작동하지만 Vercel에서 403 오류

**원인**: Vercel은 `.env.local` 파일을 읽지 않습니다. 환경 변수를 Vercel 대시보드에서 별도로 설정해야 합니다.

## ✅ 해결 방법

### 1단계: Vercel 대시보드에서 환경 변수 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 로그인 후 프로젝트 선택

2. **환경 변수 설정 페이지로 이동**
   - 프로젝트 선택 → **Settings** 탭
   - 왼쪽 메뉴에서 **Environment Variables** 클릭

3. **OPENAI_API_KEY 추가**
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `.env.local`에 있는 실제 API 키 (sk-로 시작하는 값)
   - **Environment**: 다음 3개 모두 체크
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **저장**
   - **Save** 버튼 클릭

### 2단계: 재배포 (필수!)

⚠️ **중요**: 환경 변수를 추가/수정한 후에는 반드시 재배포해야 합니다!

**방법 1: Vercel 대시보드에서**
1. **Deployments** 탭 클릭
2. 최신 배포 항목의 **⋯** (점 3개) 메뉴 클릭
3. **Redeploy** 선택
4. 확인

**방법 2: 터미널에서**
```bash
vercel --prod
```

### 3단계: 환경 변수 확인

배포가 완료되면 다음 URL로 접속:

```
https://your-project.vercel.app/api/debug/env
```

**정상적인 응답 예시:**
```json
{
  "hasApiKey": true,
  "apiKeyLength": 51,
  "apiKeyPrefix": "sk-proj...",
  "apiKeyEndsWith": "...xyz1",
  "startsWithSk": true,
  "rawEnvExists": true,
  "rawEnvLength": 51
}
```

**문제가 있는 경우:**
```json
{
  "hasApiKey": false,
  "apiKeyLength": 0,
  "startsWithSk": false
}
```

이 경우 → 1단계를 다시 확인하고 재배포하세요.

## 🔍 로컬 vs Vercel 차이점

| 항목 | 로컬 (localhost) | Vercel (배포) |
|------|-----------------|---------------|
| 환경 변수 위치 | `.env.local` 파일 | Vercel 대시보드 설정 |
| 자동 로드 | ✅ Next.js가 자동으로 읽음 | ❌ 수동으로 설정 필요 |
| 재배포 필요 | ❌ 파일 수정만으로 반영 | ✅ 환경 변수 변경 후 재배포 필수 |

## 🐛 문제 해결 체크리스트

- [ ] Vercel 대시보드에서 `OPENAI_API_KEY` 환경 변수가 설정되어 있는가?
- [ ] 환경 변수 값이 올바른가? (sk-로 시작하는 실제 API 키)
- [ ] Production, Preview, Development 모두 체크되어 있는가?
- [ ] 환경 변수 설정 후 **Redeploy**를 실행했는가?
- [ ] `/api/debug/env` 엔드포인트에서 `hasApiKey: true`가 나오는가?

## 📝 빠른 확인 명령어

```bash
# 1. 로컬 환경 변수 확인 (참고용)
cat .env.local | grep OPENAI_API_KEY

# 2. Vercel 배포된 사이트의 환경 변수 확인
curl https://your-project.vercel.app/api/debug/env

# 3. Vercel 재배포
vercel --prod
```

## ⚠️ 주의사항

1. **API 키 보안**
   - `.env.local` 파일은 절대 GitHub에 커밋하지 마세요
   - `.gitignore`에 `.env.local`이 포함되어 있는지 확인하세요

2. **환경 변수 이름**
   - 정확히 `OPENAI_API_KEY`로 설정해야 합니다 (대소문자 구분)

3. **재배포 필수**
   - 환경 변수를 추가/수정한 후에는 반드시 재배포해야 합니다
   - 재배포하지 않으면 변경사항이 반영되지 않습니다

## 🆘 여전히 문제가 있다면

1. **Vercel 함수 로그 확인**
   - Vercel 대시보드 → Functions 탭
   - `/api/ai/analyze-file` 함수 선택
   - 로그에서 `OPENAI_API_KEY` 관련 오류 확인

2. **API 키 유효성 확인**
   - OpenAI 대시보드에서 API 키가 활성화되어 있는지 확인
   - API 키 사용량/크레딧 확인

3. **다른 환경 변수 확인**
   - `USE_SUPABASE_EDGE_FUNCTIONS` 설정 확인
   - Supabase 관련 환경 변수 확인 (사용하는 경우)






