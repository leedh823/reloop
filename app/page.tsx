import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-reloop-blue/10 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              실패를 공유하고
              <br />
              <span className="text-reloop-blue">다시 도전</span>하세요
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Reloop는 실패를 부끄럽게 여기지 않고, 함께 성장할 수 있는 커뮤니티입니다.
              <br />
              디스코드에서 함께 이야기하고 다음 도전을 준비하세요.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/submit"
                className="bg-reloop-blue text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                실패 공유하기
              </Link>
              <Link
                href="/failures"
                className="bg-white text-reloop-blue border-2 border-reloop-blue px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                실패 목록 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-reloop-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. 실패 작성</h3>
              <p className="text-gray-600">
                경험한 실패를 솔직하게 작성하고 공유하세요.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-reloop-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. 디스코드에서 이야기</h3>
              <p className="text-gray-600">
                디스코드 채널에서 다른 사람들과 함께 이야기하고 조언을 나누세요.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-reloop-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. 다시 도전</h3>
              <p className="text-gray-600">
                배운 것을 바탕으로 새로운 도전을 시작하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discord CTA */}
      <section className="py-20 bg-gradient-to-br from-reloop-gold/10 to-reloop-silver/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            디스코드에서 함께 이야기해요
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            실패를 공유하면 디스코드 채널에 알림이 전송됩니다.
            <br />
            커뮤니티와 함께 성장하세요!
          </p>
          <div className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg">
            <span className="text-xl">💬</span>
            <span className="font-semibold">Discord 커뮤니티</span>
          </div>
        </div>
      </section>
    </div>
  )
}

