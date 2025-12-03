import { NextRequest, NextResponse } from 'next/server'
import { getFailureById } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 14에서 params는 Promise이므로 await 필요
    const { id } = await params
    const failure = getFailureById(id)
    
    if (!failure) {
      return NextResponse.json(
        { error: '실패를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json(failure)
  } catch (error) {
    console.error('Error fetching failure:', error)
    return NextResponse.json(
      { error: '실패를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

