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
 * OpenAI API 호출 결과 타입
 */
export interface OpenAIErrorResponse {
  ok: false
  reason: 'openai_error' | 'missing_api_key' | 'network_error' | 'unknown_error'
  status?: number
  code?: string
  type?: string
  message: string
  openaiError?: any
}

export interface OpenAISuccessResponse {
  ok: true
  content: string
}

export type OpenAIResponse = OpenAIErrorResponse | OpenAISuccessResponse

/**
 * OpenAI API를 호출합니다.
 * Vercel 환경에서의 디버깅을 위해 상세한 로그를 출력합니다.
 */
export async function callOpenAIAPI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
  }
): Promise<OpenAIResponse> {
  const baseURL = 'https://api.openai.com/v1/chat/completions'
  const model = options?.model || 'gpt-4o-mini'
  
  // 1. API 키 확인 및 로깅
  const hasApiKey = !!process.env.OPENAI_API_KEY
  const apiKeyPrefix = process.env.OPENAI_API_KEY 
    ? process.env.OPENAI_API_KEY.substring(0, 5) 
    : null
  
  console.log('[callOpenAIAPI] API 키 상태:', {
    hasKey: hasApiKey,
    keyPrefix: apiKeyPrefix,
  })
  
  if (!hasApiKey || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    console.error('[callOpenAIAPI] ❌ API 키가 없습니다:', {
      hasKey: false,
      keyPrefix: null,
      OPENAI_API_KEY_exists: !!process.env.OPENAI_API_KEY,
      OPENAI_API_KEY_length: process.env.OPENAI_API_KEY?.length || 0,
    })
    
    return {
      ok: false,
      reason: 'missing_api_key',
      message: 'OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.',
    }
  }
  
  let apiKey: string
  try {
    apiKey = getOpenAIApiKey()
  } catch (error: any) {
    console.error('[callOpenAIAPI] ❌ API 키 로드 실패:', {
      error: error?.message,
      hasKey: hasApiKey,
      keyPrefix: apiKeyPrefix,
    })
    
    return {
      ok: false,
      reason: 'missing_api_key',
      message: error?.message || 'API 키를 로드할 수 없습니다.',
    }
  }
  
  // 2. 요청 본문 구성
  const requestBody = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1500,
  }
  
  console.log('[callOpenAIAPI] 요청 정보:', {
    baseURL,
    model,
    messagesCount: messages.length,
    hasApiKey: true,
    keyPrefix: apiKey.substring(0, 5),
  })
  
  // 3. OpenAI API 호출 (try/catch로 감싸기)
  try {
    const response = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })
    
    // 4. 응답 상태 로깅
    console.log('[callOpenAIAPI] 응답 상태:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })
    
    // 5. 응답 본문 읽기
    const responseText = await response.text()
    let responseData: any = {}
    
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('[callOpenAIAPI] ❌ 응답 파싱 실패:', {
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        responseText: responseText.substring(0, 500),
      })
      responseData = { raw: responseText.substring(0, 500) }
    }
    
    // 6. 에러 응답 처리
    if (!response.ok) {
      const errorInfo = responseData?.error || {}
      const errorCode = errorInfo.code || errorInfo.type || undefined
      const errorType = errorInfo.type || undefined
      const errorMessage = errorInfo.message || responseData?.message || `HTTP ${response.status} ${response.statusText}`
      
      // 상세한 에러 로그 출력
      console.error('[callOpenAIAPI] ❌ OpenAI API 오류:', {
        status: response.status,
        statusText: response.statusText,
        code: errorCode,
        type: errorType,
        message: errorMessage,
        model,
        baseURL,
        hasApiKey: true,
        keyPrefix: apiKey.substring(0, 5),
        responseBody: responseData,
      })
      
      return {
        ok: false,
        reason: 'openai_error',
        status: response.status,
        code: errorCode,
        type: errorType,
        message: errorMessage,
        openaiError: responseData,
      }
    }
    
    // 7. 성공 응답 처리
    const content = responseData.choices?.[0]?.message?.content || ''
    
    console.log('[callOpenAIAPI] ✅ API 호출 성공:', {
      model,
      contentLength: content.length,
    })
    
    return {
      ok: true,
      content,
    }
    
  } catch (error: any) {
    // 8. 네트워크 오류나 기타 예외 처리
    console.error('[callOpenAIAPI] ❌ 예외 발생:', {
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack?.substring(0, 500),
      model,
      baseURL,
      hasApiKey: true,
      keyPrefix: apiKey.substring(0, 5),
    })
    
    return {
      ok: false,
      reason: 'network_error',
      message: error?.message || 'OpenAI API 호출 중 네트워크 오류가 발생했습니다.',
      openaiError: {
        name: error?.name,
        message: error?.message,
      },
    }
  }
}
