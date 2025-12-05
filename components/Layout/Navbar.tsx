import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-reloop-blue">Reloop</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              href="/failures" 
              className="text-gray-700 hover:text-reloop-blue transition-colors"
            >
              실패 목록
            </Link>
            <Link 
              href="/ai" 
              className="text-gray-700 hover:text-reloop-blue transition-colors"
            >
              AI 분석
            </Link>
            <Link 
              href="/submit" 
              className="bg-reloop-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              실패 공유하기
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

