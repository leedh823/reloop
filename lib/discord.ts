/**
 * Discord Webhook으로 실패 공유 알림을 전송합니다.
 * 
 * 환경 변수 설정:
 * - 로컬 개발: .env.local 파일에 DISCORD_WEBHOOK_URL 추가
 * - Vercel 배포: Vercel 대시보드 > Settings > Environment Variables에서 추가
 * 
 * Discord Webhook URL 생성 방법:
 * 1. Discord 채널 설정 > 연동 > 웹후크
 * 2. "새 웹후크 만들기" 클릭
 * 3. 웹후크 URL 복사하여 환경 변수에 설정
 */
export async function sendToDiscord(failure: {
  title: string;
  summary: string;
  category: string;
  emotionTag: string;
  id: string;
}) {
  // 환경 변수에서 Discord Webhook URL 가져오기
  // 로컬: .env.local 파일
  // Vercel: 프로젝트 설정 > Environment Variables
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL이 설정되지 않았습니다. Discord 알림이 전송되지 않습니다.');
    return;
  }

  const message = {
    content: `🚨 **새로운 실패가 공유되었습니다!**\n\n` +
      `**제목:** ${failure.title}\n` +
      `**요약:** ${failure.summary}\n` +
      `**카테고리:** ${failure.category}\n` +
      `**감정 태그:** ${failure.emotionTag}\n` +
      `**ID:** ${failure.id}\n\n` +
      `디스코드에서 함께 이야기해보세요! 💬`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Discord Webhook 전송 실패:', response.statusText);
    }
  } catch (error) {
    console.error('Discord Webhook 전송 중 오류:', error);
  }
}

