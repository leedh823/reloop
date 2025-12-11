import { NextRequest, NextResponse } from 'next/server'

/**
 * OpenAI API 연결 테스트 엔드포인트
 * 실제로 API 키가 작동하는지 확인
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  
  // 환경 변수 확인
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'API 키가 환경 변수에 없습니다',
      envKeys: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('OPEN')),
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    }, { status: 500 })
  }
  
  // API 키 형식 확인
  if (!apiKey.startsWith('sk-')) {
    return NextResponse.json({
      error: 'API 키 형식이 올바르지 않습니다',
      apiKeyPrefix: apiKey.substring(0, 10),
      apiKeyLength: apiKey.length,
    }, { status: 500 })
  }
  
  // 실제 OpenAI API에 간단한 요청 보내기
  try {
    console.log('OpenAI API 테스트 시작:', {
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 7),
    })
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    const responseText = await response.text()
    let responseData: any = {}
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText.substring(0, 200) }
    }
    
    console.log('OpenAI API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      apiKeyInfo: {
        length: apiKey.length,
        prefix: apiKey.substring(0, 7),
        endsWith: `...${apiKey.substring(apiKey.length - 4)}`,
        startsWithSk: apiKey.startsWith('sk-'),
      },
      openaiResponse: response.ok 
        ? { message: 'API 호출 성공', modelCount: Array.isArray(responseData.data) ? responseData.data.length : 'N/A' }
        : { error: responseData },
    })
  } catch (error: any) {
    console.error('OpenAI API 테스트 오류:', error)
    return NextResponse.json({
      error: 'API 호출 중 오류 발생',
      message: error.message,
      stack: error.stack?.substring(0, 200),
      apiKeyInfo: {
        length: apiKey.length,
        prefix: apiKey.substring(0, 7),
        exists: true,
      },
    }, { status: 500 })
  }
}


