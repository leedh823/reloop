import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFailureById } from '@/lib/db'

export default async function FailureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next.js 14에서 params는 Promise이므로 await 필요
  const { id } = await params
  
  // 서버 컴포넌트에서 직접 DB 함수 호출 (프로덕션 최적화)
  const failure = getFailureById(id)

  if (!failure) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/failures"
        className="text-reloop-blue hover:underline mb-6 inline-block"
      >
        ← 목록으로 돌아가기
      </Link>

      <article className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {failure.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-4 py-1 bg-reloop-blue/10 text-reloop-blue text-sm rounded-full">
                {failure.category}
              </span>
              <span className="px-4 py-1 bg-reloop-gold/10 text-reloop-gold text-sm rounded-full">
                {failure.emotionTag}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {new Date(failure.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">요약</h2>
          <p className="text-gray-700 leading-relaxed">
            {failure.summary}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">상세 내용</h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {failure.content}
          </div>
        </div>

        {failure.pdfUrl && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">관련 자료</h2>
            <a
              href={failure.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-reloop-blue hover:underline"
            >
              PDF 파일 보기 →
            </a>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-4">
            디스코드에서 이 실패에 대해 이야기해보세요! 💬
          </p>
          <div className="text-center">
            <span className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-2 rounded-lg">
              <span>💬</span>
              <span className="font-semibold">Discord 커뮤니티</span>
            </span>
          </div>
        </div>
      </article>
    </div>
  )
}

