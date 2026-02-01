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

// 히스토리 로드 또는 초기화
function loadHistory() {
  if (fs.existsSync(historyPath)) {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'))
  }
  return {
    last_updated: null,
    keywords: {},
    daily_summaries: []
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

  // 저장
  fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2))
  console.log(`\n💾 History saved to: ${historyPath}`)

  // 통계 출력
  printStats(updatedHistory)

  console.log('\n✅ Trend history update complete!\n')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
