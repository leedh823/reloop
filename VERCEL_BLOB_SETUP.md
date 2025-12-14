# Vercel Blob 설정 가이드

## 문제
`BLOB_READ_WRITE_TOKEN` 환경 변수가 없어서 Vercel Blob 업로드가 실패합니다.

## 해결 방법

### 1. Vercel 대시보드에서 Blob 스토리지 설정

1. **Vercel 대시보드 접속**
   - https://vercel.com 에 로그인
   - 프로젝트 선택: `reloop-prt`

2. **Storage 탭으로 이동**
   - 프로젝트 페이지에서 **Storage** 탭 클릭
   - 또는 **Settings** > **Storage** 메뉴

3. **Blob 스토리지 생성**
   - **Create Database** 또는 **Connect Database** 버튼 클릭
   - **Blob** 선택
   - **Continue** 클릭
   - 스토어 이름 입력 (예: `reloop-blob`)
   - **Create** 클릭

4. **환경 변수 자동 생성 확인**
   - Blob 스토리지 생성 시 `BLOB_READ_WRITE_TOKEN` 환경 변수가 자동으로 생성됩니다
   - **Settings** > **Environment Variables**에서 확인 가능

### 2. 환경 변수 확인

1. **Settings** > **Environment Variables** 메뉴로 이동
2. 다음 환경 변수가 있는지 확인:
   - `BLOB_READ_WRITE_TOKEN` (자동 생성됨)
   - `OPENAI_API_KEY` (이미 설정되어 있을 것)

### 3. 재배포

환경 변수 설정 후 **반드시 재배포**해야 합니다:

1. **Deployments** 탭으로 이동
2. 최신 배포의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. 또는 새로운 커밋을 푸시하면 자동 재배포됩니다

## 로컬 개발 환경 설정

로컬에서 테스트하려면:

1. **Vercel CLI로 환경 변수 가져오기**
   ```bash
   npx vercel env pull .env.local
   ```

2. **또는 수동으로 `.env.local` 파일에 추가**
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
   ```

## 확인 방법

설정이 완료되면:
1. 배포된 사이트에서 파일 업로드 테스트
2. 4MB 이상 파일 업로드 시 멀티파트 업로드가 정상 작동하는지 확인
3. Vercel 함수 로그에서 에러가 없는지 확인

## 참고

- Vercel Blob은 무료 플랜에서도 사용 가능합니다
- 단일 파일 크기 제한: 50MB
- 총 스토리지 용량: 플랜에 따라 다름

