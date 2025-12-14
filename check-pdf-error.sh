#!/bin/bash
# PDF 파싱 오류 확인 스크립트

echo "=== PDF 파싱 오류 진단 ==="
echo ""

# 1. pdf-parse 모듈 확인
echo "1. pdf-parse 모듈 확인:"
if npm list pdf-parse > /dev/null 2>&1; then
    echo "   ✅ pdf-parse 설치됨"
    npm list pdf-parse | grep pdf-parse
else
    echo "   ❌ pdf-parse 미설치"
fi

echo ""

# 2. Node.js 메모리 제한 확인
echo "2. Node.js 메모리 제한:"
node -e "console.log('   메모리 제한:', require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024, 'MB')"

echo ""

# 3. .next 폴더 확인
echo "3. 빌드 캐시 상태:"
if [ -d ".next" ]; then
    echo "   ✅ .next 폴더 존재"
    echo "   크기: $(du -sh .next 2>/dev/null | cut -f1)"
else
    echo "   ⚠️  .next 폴더 없음 (정상 - 아직 빌드 안됨)"
fi

echo ""

# 4. 환경 변수 확인
echo "4. 환경 변수 확인:"
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local 파일 존재"
    if grep -q "OPENAI_API_KEY" .env.local; then
        echo "   ✅ OPENAI_API_KEY 설정됨"
    else
        echo "   ⚠️  OPENAI_API_KEY 미설정"
    fi
else
    echo "   ⚠️  .env.local 파일 없음"
fi

echo ""
echo "=== 진단 완료 ==="






