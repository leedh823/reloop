import { NextRequest, NextResponse } from 'next/server'
import { createFailure, getAllFailures } from '@/lib/db'
import { sendToDiscord } from '@/lib/discord'
import { CreateFailureRequest } from '@/types'

export async function GET() {
  try {
    const failures = getAllFailures()
    return NextResponse.json(failures)
  } catch (error) {
    console.error('Error fetching failures:', error)
    return NextResponse.json(
      { error: '실패 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFailureRequest = await request.json()
    
    // 필수 필드 검증
    if (!body.title || !body.summary || !body.content || !body.category || !body.emotionTag) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const failure = createFailure({
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      emotionTag: body.emotionTag,
      pdfUrl: body.pdfUrl,
      thumbnailUrl: body.thumbnailUrl,
      author: body.author,
    })

    // Discord Webhook으로 전송
    await sendToDiscord({
      id: failure.id,
      title: failure.title,
      summary: failure.summary,
      category: failure.category,
      emotionTag: failure.emotionTag,
    })

    return NextResponse.json(failure, { status: 201 })
  } catch (error) {
    console.error('Error creating failure:', error)
    return NextResponse.json(
      { error: '실패를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

