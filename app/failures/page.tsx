import Link from 'next/link'
import { getAllFailures } from '@/lib/db'
import FailureCardCarousel from '@/components/FailureCardCarousel'

export default async function FailuresPage() {
  // 서버 컴포넌트에서 직접 DB 함수 호출 (프로덕션 최적화)
  const failures = getAllFailures()

  return (
    <div className="min-h-screen bg-white">
      {/* 가로 카드 캐러셀 섹션 */}
      <FailureCardCarousel failures={failures} />

      {/* 기존 그리드 리스트 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">실패 목록</h1>
          <Link
            href="/submit"
            className="bg-reloop-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            새 실패 공유하기
          </Link>
        </div>

        {failures.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">아직 공유된 실패가 없습니다.</p>
            <Link
              href="/submit"
              className="text-reloop-blue hover:underline font-semibold"
            >
              첫 번째 실패를 공유해보세요!
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {failures.map((failure) => (
              <Link
                key={failure.id}
                href={`/failures/${failure.id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {failure.title}
                  </h2>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {failure.summary}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-reloop-blue/10 text-reloop-blue text-xs rounded-full">
                    {failure.category}
                  </span>
                  <span className="px-3 py-1 bg-reloop-gold/10 text-reloop-gold text-xs rounded-full">
                    {failure.emotionTag}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(failure.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
