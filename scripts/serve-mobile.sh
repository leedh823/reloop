#!/bin/bash

# 모바일에서 접근 가능하도록 개발 서버 실행
# 로컬 네트워크 IP를 자동으로 감지하여 표시

# 로컬 IP 주소 찾기
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
fi

echo "=========================================="
echo "📱 모바일 앱 개발 서버"
echo "=========================================="
echo ""
echo "로컬 네트워크에서 접근:"
echo "  http://$LOCAL_IP:3000"
echo ""
echo "같은 Wi-Fi에 연결된 기기에서 위 주소로 접근하세요."
echo ""
echo "=========================================="
echo ""

# Next.js 개발 서버 실행
npm run dev -- -H 0.0.0.0

