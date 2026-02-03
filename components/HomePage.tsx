'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center">
        <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
          1인 개발자를 위한 아이디어 큐레이션
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          "무엇을 만들까?"
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            더 이상 고민하지 마세요
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          매일 글로벌 트렌드를 분석하고, 1인 개발자가 실제로 만들 수 있는
          MVP 아이디어와 인사이트를 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/insights"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-lg shadow-purple-500/25"
          >
            오늘의 인사이트 보기
          </Link>
          <Link
            href="/dev-log"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
          >
            1인 개발기 둘러보기
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            이렇게 도움을 드려요
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto">
            AI 시대, 개발 허들은 낮아졌지만 "뭘 만들지"를 정하는 건 여전히
            어렵습니다
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Daily Insights"
              description="Product Hunt, Hacker News, GitHub Trending 등 9개 소스에서 매일 트렌드를 수집하고 분석합니다."
            />
            <FeatureCard
              icon="🎯"
              title="Two Tracks"
              description="Profit Track(빠른 수익화)과 Essence Track(본질적 문제 해결), 두 가지 관점으로 아이디어를 평가합니다."
            />
            <FeatureCard
              icon="💡"
              title="MVP 아이디어"
              description="트렌드에서 발견한 기회를 1인 개발자가 바로 시작할 수 있는 MVP 아이디어로 정리합니다."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <StatCard number="9+" label="데이터 소스" />
            <StatCard number="10시" label="매일 업데이트" />
            <StatCard number="2가지" label="평가 트랙" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <img
            src="/assets/logo.png"
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-xl"
          />
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">
            안녕하세요!
          </h2>
          <p className="text-amber-800 dark:text-amber-200 text-lg leading-relaxed max-w-xl mx-auto mb-6">
            <span className="font-semibold">4년차 풀스택 개발자</span>입니다.
            <br />
            저도 여러분과 같은 1인 개발자로서, "다음에 뭘 만들지" 항상
            고민합니다.
            <br />
            그래서 직접 트렌드를 분석하고 아이디어를 정리하는 이 블로그를
            시작했습니다.
          </p>
          <p className="text-amber-700 dark:text-amber-300 font-medium">
            혼자 고민하지 말고, 트렌드에서 힌트를 얻어보세요.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            오늘의 트렌드에서 당신의 다음 프로젝트 아이디어를 찾아보세요
          </p>
          <Link
            href="/insights"
            className="inline-block px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 transition"
          >
            인사이트 보러 가기 →
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{label}</div>
    </div>
  )
}
