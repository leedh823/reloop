/**
 * OpenAI API 유틸리티
 * 환경 변수에서 API 키를 안전하게 로드하고 OpenAI API를 호출합니다.
 */

/**
 * OpenAI API 키를 환경 변수에서 로드합니다.
 * Vercel 환경에서도 확실하게 작동하도록 여러 방법을 시도합니다.
 */
export function getOpenAIApiKey(): string {
  // 모든 가능한 환경 변수 이름 시도
  const possibleKeys = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_OPENAI_API_KEY',
    'OPENAI_KEY',
  ]
  
  let apiKey: string | undefined = undefined
  
  // 각 환경 변수 이름을 순서대로 시도
  for (const keyName of possibleKeys) {
    const rawValue = process.env[keyName]
    if (rawValue) {
      const trimmed = rawValue.trim()
      if (trimmed && trimmed.startsWith('sk-')) {
        apiKey = trimmed
        console.log(`[getOpenAIApiKey] ✅ ${keyName}에서 API 키 로드 성공`)
        break
      }
    }
  }
  
  // 디버깅 정보 (환경 변수가 없을 때만)
  if (!apiKey) {
    const debugInfo = {
      checkedKeys: possibleKeys,
      foundKeys: possibleKeys.map(k => ({
        name: k,
        exists: !!process.env[k],
        length: process.env[k]?.length || 0,
        prefix: process.env[k] ? `${process.env[k].substring(0, 10)}...` : 'undefined',
        startsWithSk: process.env[k]?.startsWith('sk-') || false,
      })),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      allEnvKeys: Object.keys(process.env).filter(k => 
        k.toUpperCase().includes('OPENAI') || 
        k.toUpperCase().includes('API') ||
        k.toUpperCase().includes('KEY')
      ),
    }
    
    console.error('[getOpenAIApiKey] ❌ API 키를 찾을 수 없습니다:', JSON.stringify(debugInfo, null, 2))
    
    const errorMsg = `OPENAI_API_KEY가 설정되지 않았습니다.\n\n확인된 환경 변수:\n${debugInfo.foundKeys.map(k => `- ${k.name}: ${k.exists ? `존재 (길이: ${k.length}, sk- 시작: ${k.startsWithSk})` : '없음'}`).join('\n')}\n\nVercel 환경: ${debugInfo.vercelEnv || '로컬'}\n\n해결 방법:\n1. Vercel 대시보드 → Settings → Environment Variables\n2. OPENAI_API_KEY 추가 (sk-로 시작하는 실제 API 키)\n3. Production, Preview, Development 모두 체크\n4. Save 후 반드시 Redeploy 실행`
    
    throw new Error(errorMsg)
  }
  
  return apiKey
}

/**
 * OpenAI API를 호출합니다.
 */
export async function callOpenAIAPI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<string> {
  const apiKey = getOpenAIApiKey()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model || 'gpt-4o-mini',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1500,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorData: any = {}
    
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { raw: errorText.substring(0, 500) }
    }
    
    // 상세한 오류 정보
    const errorMessage = errorData?.error?.message || errorData?.message || `HTTP ${response.status} ${response.statusText}`
    
    // 403 오류 처리
    if (response.status === 403) {
      throw new Error(`OpenAI API 접근이 거부되었습니다.\n\n가능한 원인:\n1. Vercel 대시보드에서 OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.\n2. 환경 변수 설정 후 재배포가 필요합니다.\n3. API 키가 유효하지 않거나 만료되었습니다.\n\n해결 방법:\n- Vercel 대시보드 → Settings → Environment Variables에서 OPENAI_API_KEY 확인\n- 환경 변수 설정 후 반드시 Redeploy 실행\n- /api/debug/env 또는 /api/ai/test-env 엔드포인트에서 환경 변수 상태 확인`)
    }
    
    // 401 오류 처리
    if (response.status === 401) {
      throw new Error(`OpenAI API 인증에 실패했습니다. API 키를 확인해주세요.`)
    }
    
    // 기타 오류
    throw new Error(`OpenAI API 오류: ${errorMessage}`)
  }
  
  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

