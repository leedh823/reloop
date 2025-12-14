import { NextRequest, NextResponse } from 'next/server'
import { createFailure, getAllFailures } from '@/lib/db'
import { sendToDiscord } from '@/lib/discord'
import { Failure } from '@/types/failure'

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
    const body = await request.json()
    
    // 필수 필드 검증
    if (!body.title || !body.summary || !body.category || !body.emotion) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다. (title, summary, category, emotion)' },
        { status: 400 }
      )
    }

    const failure = createFailure({
      title: body.title,
      summary: body.summary,
      detail: body.detail,
      category: body.category,
      emotion: body.emotion,
      images: body.images,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileType: body.fileType,
      aiStatus: body.aiStatus || 'none',
      authorId: body.authorId,
      authorName: body.authorName,
      avatarId: body.avatarId,
    })

    // Discord Webhook으로 전송 (선택적)
    try {
      await sendToDiscord({
        id: failure.id,
        title: failure.title,
        summary: failure.summary,
        category: failure.category || '',
        emotionTag: failure.emotion || '',
      })
    } catch (discordError) {
      console.warn('Discord webhook 전송 실패:', discordError)
      // Discord 오류는 무시하고 계속 진행
    }

    return NextResponse.json(failure, { status: 201 })
  } catch (error) {
    console.error('Error creating failure:', error)
    return NextResponse.json(
      { error: '실패를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

