import Link from 'next/link'
import { getAllFailures } from '@/lib/db'
import FailureCardCarousel from '@/components/Failures/FailureCardCarousel'

export default async function FailuresPage() {
  // 서버 컴포넌트에서 직접 DB 함수 호출 (프로덕션 최적화)
  const failures = getAllFailures()

  return (
    <div className="min-h-screen bg-black">
      {/* 가로 카드 캐러셀 섹션 */}
      <FailureCardCarousel failures={failures} />

      {/* 실패 목록 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 md:py-12">
        {/* 헤더 영역 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">실패 목록</h1>
          <Link
            href="/submit"
            className="bg-reloop-blue text-white px-6 py-3 h-12 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-center w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-reloop-blue focus:ring-offset-2 focus:ring-offset-black"
          >
            새 실패 공유하기
          </Link>
        </div>

        {failures.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-base md:text-lg mb-4">아직 공유된 실패가 없습니다.</p>
            <Link
              href="/submit"
              className="text-reloop-blue hover:underline font-semibold"
            >
              첫 번째 실패를 공유해보세요!
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {failures.map((failure) => (
              <Link
                key={failure.id}
                href={`/failures/${failure.id}`}
                className="block bg-[#1a1a1a] border border-white/10 rounded-lg p-4 md:p-6 hover:border-reloop-blue/50 hover:shadow-lg hover:shadow-reloop-blue/10 transition-all duration-200 shadow-md shadow-black/20"
              >
                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold text-white line-clamp-2 leading-tight">
                    {failure.title}
                  </h2>
                  <p className="text-gray-400 text-sm md:text-base leading-relaxed line-clamp-3">
                    {failure.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-reloop-blue/20 text-reloop-blue text-xs rounded-full font-medium">
                      {failure.category}
                    </span>
                    <span className="px-3 py-1 bg-reloop-gold/20 text-reloop-gold text-xs rounded-full font-medium">
                      {failure.emotionTag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t border-white/10">
                    {new Date(failure.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
