# Cloudflare R2 설정 가이드

이 프로젝트는 **Cloudflare R2**를 사용하여 대용량 파일 업로드를 처리합니다. R2는 AWS S3 호환 API를 제공하며, egress 비용이 없어 비용 효율적입니다.

## 1. Cloudflare R2 버킷 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com)에 로그인
2. **R2** 메뉴로 이동
3. **Create bucket** 클릭
4. 버킷 이름 입력 (예: `reloop-uploads`)
5. **Create bucket** 클릭

## 2. R2 API 토큰 생성

1. R2 페이지에서 **Manage R2 API Tokens** 클릭
2. **Create API Token** 클릭
3. 토큰 설정:
   - **Token name**: `reloop-upload-token` (원하는 이름)
   - **Permissions**: **Object Read & Write** 선택
   - **TTL**: 필요에 따라 설정 (기본값: 무제한)
4. **Create API Token** 클릭
5. **Access Key ID**와 **Secret Access Key** 복사 (한 번만 표시됨!)

## 3. R2 버킷 공개 URL 설정 (선택적)

R2 버킷을 공개로 설정하려면:

1. 버킷 설정에서 **Public access** 활성화
2. **Custom Domain** 또는 **R2.dev subdomain** 설정
   - R2.dev subdomain: `https://<account-id>.r2.dev`
   - Custom Domain: 자신의 도메인 사용

## 4. 환경 변수 설정

### 로컬 개발 (.env.local)

```env
# Cloudflare R2 설정
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=reloop-uploads
R2_PUBLIC_URL=https://your-account-id.r2.dev  # 선택적
```

### Vercel 배포

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Environment Variables** 메뉴로 이동
3. 다음 환경 변수 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare 계정 ID | Production, Preview, Development |
| `R2_ACCESS_KEY_ID` | R2 Access Key ID | Production, Preview, Development |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Access Key | Production, Preview, Development |
| `R2_BUCKET_NAME` | 버킷 이름 (예: `reloop-uploads`) | Production, Preview, Development |
| `R2_PUBLIC_URL` | 공개 URL (선택적) | Production, Preview, Development |

4. **Save** 클릭
5. **Redeploy** 실행

## 5. Account ID 찾기

Cloudflare 계정 ID는:
- R2 페이지 URL에서 확인: `https://dash.cloudflare.com/<account-id>/r2`
- 또는 R2 버킷 설정에서 확인

## 6. 테스트

설정이 완료되면:

1. 개발 서버 재시작: `npm run dev`
2. 파일 업로드 테스트
3. Vercel에 배포 후 프로덕션 환경에서도 테스트

## 문제 해결

### "R2 환경 변수가 설정되지 않았습니다" 오류

- 모든 환경 변수가 설정되었는지 확인
- Vercel에서는 재배포 필요

### "Access Denied" 오류

- R2 API 토큰 권한 확인 (Object Read & Write 필요)
- 버킷 이름이 정확한지 확인

### 파일이 업로드되지 않음

- R2 버킷이 생성되었는지 확인
- API 토큰이 유효한지 확인
- 네트워크 연결 확인

## 비용

Cloudflare R2는:
- **Storage**: $0.015/GB/월
- **Class A Operations** (읽기): $4.50/백만 요청
- **Class B Operations** (쓰기): $0.36/백만 요청
- **Egress**: 무료 (다른 클라우드 서비스 대비 큰 장점!)

## 참고 자료

- [Cloudflare R2 문서](https://developers.cloudflare.com/r2/)
- [AWS S3 호환 API](https://developers.cloudflare.com/r2/api/s3/api/)

