#!/bin/bash
# 서버 상태 확인 스크립트

echo "🔍 서버 상태 확인 중..."
echo ""

# 1. 개발 서버 프로세스 확인
echo "1. 개발 서버 프로세스:"
if pgrep -f "next dev" > /dev/null; then
    echo "   ✅ 개발 서버 실행 중"
    ps aux | grep "next dev" | grep -v grep | head -1
else
    echo "   ❌ 개발 서버 미실행"
fi
echo ""

# 2. 포트 3000 확인
echo "2. 포트 3000 상태:"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ✅ 포트 3000 사용 중"
else
    echo "   ❌ 포트 3000 미사용"
fi
echo ""

# 3. API 엔드포인트 테스트
echo "3. API 엔드포인트 테스트:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/debug/env 2>/dev/null)
if [ "$STATUS" = "200" ]; then
    echo "   ✅ /api/debug/env: 정상 ($STATUS)"
else
    echo "   ❌ /api/debug/env: 오류 ($STATUS)"
fi
echo ""

# 4. 빌드 캐시 확인
echo "4. 빌드 캐시:"
if [ -d ".next" ]; then
    echo "   ✅ .next 폴더 존재"
    SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "   📦 크기: $SIZE"
else
    echo "   ⚠️  .next 폴더 없음 (빌드 필요)"
fi
echo ""

# 5. 주요 페이지 확인
echo "5. 주요 페이지:"
for PAGE in "/" "/ai" "/failures"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$PAGE" 2>/dev/null)
    if [ "$STATUS" = "200" ]; then
        echo "   ✅ $PAGE: 정상 ($STATUS)"
    else
        echo "   ❌ $PAGE: 오류 ($STATUS)"
    fi
done
echo ""

echo "✅ 확인 완료"






