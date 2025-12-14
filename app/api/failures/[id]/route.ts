import { NextRequest, NextResponse } from 'next/server'
import { getFailureById, updateFailure, deleteFailure } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const failure = getFailureById(params.id)
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updated = updateFailure(params.id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: '실패를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating failure:', error)
    return NextResponse.json(
      { error: '실패를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteFailure(params.id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: '실패를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting failure:', error)
    return NextResponse.json(
      { error: '실패를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
