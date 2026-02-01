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

export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...docsComponents,
    YouTubeThumbnail,
    StatCard,
    TrendBadge,
    RankBar,
    ...components
  }
}
