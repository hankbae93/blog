#!/usr/bin/env node

/**
 * PRD-Agent Trend History Tracker
 * 키워드 트렌드를 추적하고 히스토리에 저장
 */

const fs = require('fs')
const path = require('path')

const config = require('../config.json')

const today = new Date().toISOString().split('T')[0]
const historyPath = path.join(process.cwd(), 'generated/trends/history.json')
const sourcesDir = path.join(process.cwd(), config.output.sources_dir)

// 날짜 계산 헬퍼
function getDateString(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

// 특정 날짜의 소스 데이터 로드
function loadSourceByDate(dateStr) {
  const sourcePath = path.join(sourcesDir, `${dateStr}.json`)
  if (!fs.existsSync(sourcePath)) {
    return null
  }
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
}

// 전일/전주 소스 데이터 로드
function loadPreviousSources() {
  const yesterday = getDateString(1)
  const lastWeek = getDateString(7)

  return {
    yesterday: loadSourceByDate(yesterday),
    lastWeek: loadSourceByDate(lastWeek),
    yesterdayDate: yesterday,
    lastWeekDate: lastWeek
  }
}

// 소스별 평균 메트릭 계산
function calculateSourceMetrics(sourceData) {
  if (!sourceData?.sources) return null

  const metrics = {}

  // Product Hunt 메트릭
  const phItems = sourceData.sources.product_hunt?.items || []
  if (phItems.length > 0) {
    metrics.product_hunt = {
      avgVotes: Math.round(phItems.reduce((sum, item) => sum + (item.votesCount || 0), 0) / phItems.length),
      maxVotes: Math.max(...phItems.map(item => item.votesCount || 0)),
      avgComments: Math.round(phItems.reduce((sum, item) => sum + (item.commentsCount || 0), 0) / phItems.length),
      totalItems: phItems.length
    }
  }

  // Hacker News 메트릭
  const hnItems = sourceData.sources.hacker_news?.items || []
  if (hnItems.length > 0) {
    metrics.hacker_news = {
      avgPoints: Math.round(hnItems.reduce((sum, item) => sum + (item.points || 0), 0) / hnItems.length),
      maxPoints: Math.max(...hnItems.map(item => item.points || 0)),
      avgComments: Math.round(hnItems.reduce((sum, item) => sum + (item.comments || 0), 0) / hnItems.length),
      totalItems: hnItems.length
    }
  }

  // GitHub Trending 메트릭
  const ghItems = sourceData.sources.github_trending?.items || []
  if (ghItems.length > 0) {
    metrics.github_trending = {
      avgStarsToday: Math.round(ghItems.reduce((sum, item) => sum + (item.stars_today || 0), 0) / ghItems.length),
      maxStarsToday: Math.max(...ghItems.map(item => item.stars_today || 0)),
      totalItems: ghItems.length
    }
  }

  // YouTube Trending 메트릭
  const ytItems = sourceData.sources.youtube_trending?.items || []
  if (ytItems.length > 0) {
    metrics.youtube_trending = {
      avgViews: Math.round(ytItems.reduce((sum, item) => sum + (item.views || 0), 0) / ytItems.length),
      maxViews: Math.max(...ytItems.map(item => item.views || 0)),
      totalItems: ytItems.length
    }
  }

  return metrics
}

// 성장률 계산 (퍼센트)
function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

// 메트릭 비교
function compareMetrics(todayMetrics, previousMetrics) {
  if (!todayMetrics || !previousMetrics) return null

  const comparisons = {}

  // Product Hunt 비교
  if (todayMetrics.product_hunt && previousMetrics.product_hunt) {
    comparisons.product_hunt = {
      votesChange: calculateGrowthRate(todayMetrics.product_hunt.avgVotes, previousMetrics.product_hunt.avgVotes),
      maxVotesChange: calculateGrowthRate(todayMetrics.product_hunt.maxVotes, previousMetrics.product_hunt.maxVotes)
    }
  }

  // Hacker News 비교
  if (todayMetrics.hacker_news && previousMetrics.hacker_news) {
    comparisons.hacker_news = {
      pointsChange: calculateGrowthRate(todayMetrics.hacker_news.avgPoints, previousMetrics.hacker_news.avgPoints),
      maxPointsChange: calculateGrowthRate(todayMetrics.hacker_news.maxPoints, previousMetrics.hacker_news.maxPoints)
    }
  }

  // GitHub 비교
  if (todayMetrics.github_trending && previousMetrics.github_trending) {
    comparisons.github_trending = {
      starsChange: calculateGrowthRate(todayMetrics.github_trending.avgStarsToday, previousMetrics.github_trending.avgStarsToday)
    }
  }

  // YouTube 비교
  if (todayMetrics.youtube_trending && previousMetrics.youtube_trending) {
    comparisons.youtube_trending = {
      viewsChange: calculateGrowthRate(todayMetrics.youtube_trending.avgViews, previousMetrics.youtube_trending.avgViews)
    }
  }

  return comparisons
}

// 히스토리 로드 또는 초기화
function loadHistory() {
  if (fs.existsSync(historyPath)) {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  }
  return {
    last_updated: null,
    keywords: {},
    daily_summaries: [],
    metrics: {},
    comparisons: {}
  }
}

// 오늘의 소스 데이터 로드
function loadTodaySource() {
  const sourcePath = path.join(sourcesDir, `${today}.json`)
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  No source file for ${today}`)
    return null
  }
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
}

// 키워드 추출
function extractKeywords(sourceData) {
  const keywords = {}

  // Product Hunt 토픽
  sourceData.sources?.product_hunt?.items?.forEach(item => {
    item.topics?.forEach(topic => {
      const normalized = topic.toLowerCase().trim()
      keywords[normalized] = (keywords[normalized] || 0) + 3
    })
  })

  // GitHub 언어 및 설명
  sourceData.sources?.github_trending?.items?.forEach(item => {
    if (item.language) {
      const lang = item.language.toLowerCase()
      keywords[lang] = (keywords[lang] || 0) + 2
    }
  })

  // Hacker News 제목에서 키워드 추출
  sourceData.sources?.hacker_news?.items?.forEach(item => {
    const words = (item.title || '').toLowerCase().split(/\s+/)
    words.forEach(word => {
      // 중요 키워드만 추출
      const importantPatterns = ['ai', 'llm', 'agent', 'startup', 'saas', 'api', 'dev', 'code', 'open-source', 'rust', 'python', 'javascript', 'typescript']
      if (importantPatterns.some(p => word.includes(p))) {
        keywords[word] = (keywords[word] || 0) + 1
      }
    })
  })

  // key_trends에서 직접 추가
  sourceData.key_trends?.forEach(trend => {
    const normalized = trend.toLowerCase().trim()
    keywords[normalized] = (keywords[normalized] || 0) + 5
  })

  return keywords
}

// 트렌드 방향 계산
function calculateTrend(occurrences) {
  if (occurrences.length < 2) return 'new'

  const recent = occurrences.slice(-7)
  if (recent.length < 2) return 'stable'

  const recentSum = recent.reduce((sum, o) => sum + o.count, 0)
  const recentAvg = recentSum / recent.length

  const older = occurrences.slice(-14, -7)
  if (older.length === 0) return recentAvg > 1 ? 'rising' : 'stable'

  const olderSum = older.reduce((sum, o) => sum + o.count, 0)
  const olderAvg = olderSum / older.length

  if (recentAvg > olderAvg * 1.5) return 'rising'
  if (recentAvg < olderAvg * 0.5) return 'falling'
  return 'stable'
}

// 히스토리 업데이트
function updateHistory(history, todayKeywords) {
  // 각 키워드 업데이트
  Object.entries(todayKeywords).forEach(([keyword, count]) => {
    if (!history.keywords[keyword]) {
      history.keywords[keyword] = {
        first_seen: today,
        occurrences: [],
        trend: 'new',
        total_count: 0
      }
    }

    const kw = history.keywords[keyword]

    // 오늘 이미 기록되어 있으면 스킵
    const todayOccurrence = kw.occurrences.find(o => o.date === today)
    if (!todayOccurrence) {
      kw.occurrences.push({ date: today, count })
      kw.total_count += count
    }

    // 90일 이상 된 데이터 정리
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    kw.occurrences = kw.occurrences.filter(o =>
      new Date(o.date) >= cutoff
    )

    // 트렌드 재계산
    kw.trend = calculateTrend(kw.occurrences)
  })

  // 일일 요약 추가
  const topKeywords = Object.entries(todayKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k)

  history.daily_summaries.push({
    date: today,
    top_keywords: topKeywords,
    total_keywords: Object.keys(todayKeywords).length
  })

  // 90일 이상 된 요약 정리
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  history.daily_summaries = history.daily_summaries.filter(s =>
    new Date(s.date) >= cutoff
  )

  history.last_updated = today

  return history
}

// 통계 출력
function printStats(history) {
  console.log('\n📊 Trend Statistics')
  console.log('='.repeat(50))

  // Rising 트렌드
  const rising = Object.entries(history.keywords)
    .filter(([_, v]) => v.trend === 'rising')
    .sort((a, b) => b[1].total_count - a[1].total_count)
    .slice(0, 5)

  if (rising.length > 0) {
    console.log('\n🔥 Rising Trends:')
    rising.forEach(([k, v]) => {
      console.log(`   ${k}: ${v.total_count} (since ${v.first_seen})`)
    })
  }

  // New 트렌드
  const newTrends = Object.entries(history.keywords)
    .filter(([_, v]) => v.trend === 'new' && v.first_seen === today)
    .slice(0, 5)

  if (newTrends.length > 0) {
    console.log('\n✨ New Today:')
    newTrends.forEach(([k]) => {
      console.log(`   ${k}`)
    })
  }

  // 전체 통계
  console.log(`\n📈 Total tracked keywords: ${Object.keys(history.keywords).length}`)
  console.log(`📅 History days: ${history.daily_summaries.length}`)
}

// 메인 함수
async function main() {
  console.log(`\n📈 PRD-Agent Trend History Update - ${today}\n`)

  // 데이터 로드
  const history = loadHistory()
  const sourceData = loadTodaySource()

  if (!sourceData) {
    console.log('⚠️  No source data to process')
    process.exit(0)
  }

  // 키워드 추출 및 업데이트
  const todayKeywords = extractKeywords(sourceData)
  console.log(`📝 Extracted ${Object.keys(todayKeywords).length} keywords from today's data`)

  const updatedHistory = updateHistory(history, todayKeywords)

  // 메트릭 및 성장률 계산
  console.log('\n📊 Calculating metrics and growth rates...')
  const previousSources = loadPreviousSources()
  const todayMetrics = calculateSourceMetrics(sourceData)

  if (todayMetrics) {
    updatedHistory.metrics[today] = todayMetrics

    // 전일 비교
    if (previousSources.yesterday) {
      const yesterdayMetrics = calculateSourceMetrics(previousSources.yesterday)
      const vsYesterday = compareMetrics(todayMetrics, yesterdayMetrics)
      if (vsYesterday) {
        updatedHistory.comparisons[today] = updatedHistory.comparisons[today] || {}
        updatedHistory.comparisons[today].vs_yesterday = vsYesterday
        console.log(`   📈 vs Yesterday (${previousSources.yesterdayDate}): calculated`)
      }
    } else {
      console.log(`   ⚠️  No data for yesterday (${previousSources.yesterdayDate})`)
    }

    // 전주 비교
    if (previousSources.lastWeek) {
      const lastWeekMetrics = calculateSourceMetrics(previousSources.lastWeek)
      const vsLastWeek = compareMetrics(todayMetrics, lastWeekMetrics)
      if (vsLastWeek) {
        updatedHistory.comparisons[today] = updatedHistory.comparisons[today] || {}
        updatedHistory.comparisons[today].vs_last_week = vsLastWeek
        console.log(`   📈 vs Last Week (${previousSources.lastWeekDate}): calculated`)
      }
    } else {
      console.log(`   ⚠️  No data for last week (${previousSources.lastWeekDate})`)
    }

    // 90일 이상 된 메트릭/비교 정리
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)
    const cutoffStr = cutoff.toISOString().split('T')[0]

    Object.keys(updatedHistory.metrics).forEach(date => {
      if (date < cutoffStr) delete updatedHistory.metrics[date]
    })
    Object.keys(updatedHistory.comparisons).forEach(date => {
      if (date < cutoffStr) delete updatedHistory.comparisons[date]
    })
  }

  // 저장
  fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2))
  console.log(`\n💾 History saved to: ${historyPath}`)

  // 통계 출력
  printStats(updatedHistory)

  // 메트릭 요약 출력
  if (todayMetrics) {
    console.log('\n📊 Today\'s Metrics Summary:')
    if (todayMetrics.product_hunt) {
      console.log(`   Product Hunt: max ${todayMetrics.product_hunt.maxVotes} votes, avg ${todayMetrics.product_hunt.avgVotes}`)
    }
    if (todayMetrics.hacker_news) {
      console.log(`   Hacker News: max ${todayMetrics.hacker_news.maxPoints} points, avg ${todayMetrics.hacker_news.avgPoints}`)
    }
    if (todayMetrics.github_trending) {
      console.log(`   GitHub: max ${todayMetrics.github_trending.maxStarsToday} stars today`)
    }
    if (todayMetrics.youtube_trending) {
      console.log(`   YouTube: max ${todayMetrics.youtube_trending.maxViews.toLocaleString()} views`)
    }
  }

  console.log('\n✅ Trend history update complete!\n')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
