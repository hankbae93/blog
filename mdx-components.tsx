import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

const docsComponents = getDocsMDXComponents()

// YouTube 썸네일 컴포넌트 (클릭하면 재생)
function YouTubeThumbnail({
  id,
  title,
  views,
  channel,
  thumbnail
}: {
  id: string
  title: string
  views?: number
  channel?: string
  thumbnail?: string
}) {
  const thumbnailUrl = thumbnail || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
  const videoUrl = `https://www.youtube.com/watch?v=${id}`

  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="youtube-thumbnail block no-underline hover:no-underline"
    >
      <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 bg-gray-100 dark:bg-gray-800">
        <div className="relative aspect-video">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-1">
            {title}
          </h4>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {channel && <span>{channel}</span>}
            {views !== undefined && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {formatViews(views)}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

// 핵심 숫자 카드 컴포넌트
function StatCard({
  label,
  value,
  change,
  icon
}: {
  label: string
  value: string | number
  change?: string
  icon?: string
}) {
  const isPositive = change?.startsWith('+')
  const isNegative = change?.startsWith('-')

  return (
    <div className="stat-card bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white highlight-number">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {change && (
        <p className={`text-sm mt-2 font-medium ${
          isPositive ? 'text-green-600 dark:text-green-400' :
          isNegative ? 'text-red-600 dark:text-red-400' :
          'text-gray-500 dark:text-gray-400'
        }`}>
          {change}
        </p>
      )}
    </div>
  )
}

// 트렌드 뱃지 컴포넌트
function TrendBadge({
  direction,
  value,
  label
}: {
  direction: 'up' | 'down' | 'new' | 'stable'
  value?: string
  label?: string
}) {
  const config = {
    up: { icon: '🔺', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
    down: { icon: '🔻', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
    new: { icon: '✨', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    stable: { icon: '➖', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' }
  }

  const { icon, bg, text } = config[direction]

  return (
    <span className={`trend-badge inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <span>{icon}</span>
      {label && <span>{label}</span>}
      {value && <span className="font-bold">{value}</span>}
    </span>
  )
}

// 순위 프로그레스 바 컴포넌트
function RankBar({
  rank,
  maxRank = 10,
  label,
  value,
  color = 'blue'
}: {
  rank: number
  maxRank?: number
  label: string
  value?: string | number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}) {
  const percentage = ((maxRank - rank + 1) / maxRank) * 100

  const colorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-400',
    green: 'bg-green-500 dark:bg-green-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
    orange: 'bg-orange-500 dark:bg-orange-400',
    red: 'bg-red-500 dark:bg-red-400'
  }

  return (
    <div className="rank-bar mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-6">
            #{rank}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        </div>
        {value !== undefined && (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Hacker News 카드 컴포넌트
function HackerNewsCard({
  title,
  url,
  points,
  comments
}: {
  title: string
  url: string
  points: number
  comments: number
}) {
  const isHot = points >= 300
  const isWarm = points >= 100

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="hn-card block no-underline hover:no-underline"
    >
      <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 ${
        isHot ? 'border-l-orange-500' : isWarm ? 'border-l-yellow-500' : 'border-l-gray-300 dark:border-l-gray-600'
      } hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start gap-3 mb-2">
          <span className="font-medium text-gray-900 dark:text-white text-sm leading-snug">
            {title}
          </span>
          <span className={`shrink-0 text-sm font-bold ${
            isHot ? 'text-orange-500' : isWarm ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'
          }`}>
            {isHot ? '🔥🔥' : isWarm ? '🔥' : '▲'} {points}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          💬 {comments} comments
        </div>
      </div>
    </a>
  )
}

// GitHub 레포지토리 카드 컴포넌트
function GitHubRepoCard({
  name,
  description,
  language,
  stars,
  url
}: {
  name: string
  description: string
  language?: string
  stars: number
  url: string
}) {
  const languageColors: Record<string, string> = {
    TypeScript: 'bg-blue-500',
    JavaScript: 'bg-yellow-400',
    Python: 'bg-green-500',
    Rust: 'bg-orange-600',
    Go: 'bg-cyan-500',
    Java: 'bg-red-500',
    'C++': 'bg-pink-500',
    C: 'bg-gray-600',
    Ruby: 'bg-red-600',
    PHP: 'bg-indigo-400',
    Swift: 'bg-orange-500',
    Kotlin: 'bg-purple-500',
    Dart: 'bg-cyan-400',
    Shell: 'bg-green-600',
    MDX: 'bg-yellow-500'
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="github-card block no-underline hover:no-underline"
    >
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow h-full">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
          </svg>
          <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{name}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            {language && (
              <>
                <span className={`w-3 h-3 rounded-full ${languageColors[language] || 'bg-gray-400'}`}></span>
                <span>{language}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
            </svg>
            <span className="font-medium">{stars.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

// 소스 태그 컴포넌트 (Lobsters 등)
function SourceTag({ tag }: { tag: string }) {
  const tagColors: Record<string, string> = {
    security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    api: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    performance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    ml: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    practices: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    programming: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    web: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    nix: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    devops: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    linux: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'c++': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    retrocomputing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    reversing: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    hardware: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    art: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    vibecoding: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
  }

  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
      {tag}
    </span>
  )
}

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...docsComponents,
    YouTubeThumbnail,
    StatCard,
    TrendBadge,
    RankBar,
    HackerNewsCard,
    GitHubRepoCard,
    SourceTag,
    ...components
  }
}
