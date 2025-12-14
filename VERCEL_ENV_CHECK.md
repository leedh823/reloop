# Vercel 환경 변수 확인 체크리스트

## ⚠️ 필수 확인 사항

### 1. Vercel 대시보드에서 환경 변수 설정

1. https://vercel.com 접속 → 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. 다음 환경 변수가 **모두** 설정되어 있는지 확인:

```
OPENAI_API_KEY = sk-실제API키
```

4. **중요**: 각 환경 변수에서 다음을 모두 체크:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. **Save** 클릭 후 **반드시 Redeploy** 실행

### 2. 배포 후 확인

배포가 완료되면 다음 URL로 접속:

```
https://your-project.vercel.app/api/debug/env
```

확인 사항:
- `hasApiKey`: `true` ✅
- `apiKeyLength`: 51 이상 ✅
- `startsWithSk`: `true` ✅
- `apiKeyPrefix`: `sk-proj...` 또는 실제 키 접두사 ✅

### 3. Vercel 함수 로그 확인

1. Vercel 대시보드 → 프로젝트 선택
2. **Functions** 탭 클릭
3. `/api/ai/analyze-file` 함수 선택
4. 로그에서 다음 확인:

```
✅ [analyze-file] 요청 시작
✅ [analyze-file] pdf-parse 모듈 로드 완료
✅ API Key 체크: { exists: true, length: 51+, startsWithSk: true }
✅ OpenAI API 호출 준비
```

### 4. 일반적인 문제 해결

#### 문제: "OPENAI_API_KEY가 설정되지 않았습니다"

**해결**:
1. Vercel 대시보드에서 환경 변수 확인
2. 환경 변수 이름이 정확한지 확인 (`OPENAI_API_KEY`)
3. **모든 환경**에 설정되어 있는지 확인
4. **Redeploy** 실행 (환경 변수 변경 후 필수!)

#### 문제: "API 키 형식이 올바르지 않습니다"

**해결**:
1. API 키가 `sk-`로 시작하는지 확인
2. API 키에 공백이나 줄바꿈이 없는지 확인
3. Vercel 환경 변수에서 Value를 다시 확인

#### 문제: 504 Gateway Timeout

**해결**:
1. 파일 크기가 너무 큰 경우 (20MB+)
2. Vercel Pro 플랜으로 업그레이드 고려
3. 또는 파일 크기 제한을 낮춤

## 빠른 확인 명령어

배포 후 터미널에서:

```bash
# 환경 변수 확인
curl https://your-project.vercel.app/api/debug/env

# API 테스트 (작은 파일)
curl -X POST https://your-project.vercel.app/api/ai/analyze-file \
  -F "file=@test.txt" \
  -F "description=테스트"
```

## 중요 사항

⚠️ **환경 변수를 변경한 후에는 반드시 Redeploy 해야 합니다!**
- Vercel 대시보드 → **Deployments** → 최신 배포 → **Redeploy**

⚠️ **환경 변수는 코드에 포함하지 마세요!**
- `.env.local`은 `.gitignore`에 포함되어 있어야 합니다
- GitHub에 API 키를 커밋하지 마세요






