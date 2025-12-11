# AI API 키 설정 가이드

## 🔑 OpenAI API 키 설정 위치

### 1. Vercel 환경 변수 설정 (프로덕션)

**Vercel 대시보드에서 설정:**

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **환경 변수 설정**
   - **Settings** → **Environment Variables** 클릭
   - **Add New** 버튼 클릭

3. **환경 변수 추가**
   ```
   Key: OPENAI_API_KEY
   Value: sk-... (OpenAI API 키)
   Environment: ✅ Production, ✅ Preview, ✅ Development (모두 체크)
   ```
   - **Save** 클릭

4. **재배포 필수!**
   - **Deployments** → 최신 배포 → **"..." 메뉴** → **"Redeploy"**
   - 환경 변수 변경 후 반드시 재배포해야 적용됩니다

### 2. 로컬 개발 환경 설정

**`.env.local` 파일 생성 (프로젝트 루트):**

```bash
# 프로젝트 루트에 .env.local 파일 생성
OPENAI_API_KEY=sk-your-api-key-here
```

**주의:**
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 이 파일을 직접 생성해야 합니다

### 3. OpenAI API 키 발급 방법

1. **OpenAI 대시보드 접속**
   - https://platform.openai.com/api-keys

2. **새 API 키 생성**
   - "Create new secret key" 클릭
   - 키 이름 입력 (예: "Reloop Production")
   - 생성된 키 복사 (한 번만 보여줌!)

3. **크레딧 확인**
   - https://platform.openai.com/account/billing
   - 최소 $5 이상 크레딧 필요

## 🌐 호스트 API URL 설정 (개발 테스트용)

### 로컬 개발 서버에서 테스트할 때

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **AI 분석 페이지 접속**
   - http://localhost:3000/ai

3. **호스트 설정 UI 사용**
   - 우측 하단 "🔧 API 호스트 설정" 버튼 클릭
   - 호스트 URL 입력 (예: `https://reloop-beta.vercel.app`)
   - **저장** 클릭

4. **테스트**
   - **테스트** 버튼으로 연결 확인
   - 파일 업로드 후 AI 분석 테스트

### 환경 변수로 설정 (선택사항)

**`.env.local` 파일에 추가:**
```bash
NEXT_PUBLIC_API_HOST=https://reloop-beta.vercel.app
```

## 📋 체크리스트

### Vercel 프로덕션 배포
- [ ] Vercel 대시보드 → Settings → Environment Variables
- [ ] `OPENAI_API_KEY` 환경 변수 추가
- [ ] Production, Preview, Development 모두 체크
- [ ] 재배포 완료

### 로컬 개발
- [ ] `.env.local` 파일 생성
- [ ] `OPENAI_API_KEY=sk-...` 추가
- [ ] 개발 서버 재시작 (`npm run dev`)

### 호스트 테스트 (선택)
- [ ] 개발 서버 실행
- [ ] AI 페이지에서 호스트 URL 설정
- [ ] API 연결 테스트

## 🔍 확인 방법

### 1. 환경 변수 확인
배포된 사이트에서:
```
https://reloop-beta.vercel.app/api/debug/env
```

확인할 내용:
- `hasApiKey: true`
- `startsWithSk: true`
- `apiKeyLength: 50 이상`

### 2. API 테스트
```
https://reloop-beta.vercel.app/api/test-openai
```

성공 시:
- `success: true`
- `status: 200`

## ⚠️ 주의사항

1. **API 키 보안**
   - 절대 Git에 커밋하지 마세요
   - `.env.local`은 `.gitignore`에 포함되어 있습니다
   - Vercel 환경 변수는 암호화되어 저장됩니다

2. **재배포 필수**
   - Vercel 환경 변수 변경 후 반드시 재배포해야 합니다
   - 재배포하지 않으면 변경사항이 적용되지 않습니다

3. **API 키 형식**
   - `sk-`로 시작해야 합니다
   - 앞뒤 공백이 없어야 합니다
   - 전체 키를 복사했는지 확인하세요

## 🆘 문제 해결

### API 키가 작동하지 않을 때

1. **형식 확인**
   - `sk-`로 시작하는지 확인
   - 앞뒤 공백 제거

2. **크레딧 확인**
   - OpenAI 대시보드에서 크레딧 확인
   - 최소 $5 이상 필요

3. **재배포 확인**
   - Vercel에서 재배포했는지 확인
   - 배포 로그에서 환경 변수 로드 확인

4. **로그 확인**
   - Vercel 대시보드 → Deployments → Functions
   - `/api/ai/analyze-file` 로그 확인
   - `API Key 체크:` 로그 확인


