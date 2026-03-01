#!/usr/bin/env node

/**
 * PRD-Agent App Trends Analyzer
 * 앱 스토어 니치 앱의 순위 변동률과 급상승 앱을 분석
 */

const fs = require('fs')
const path = require('path')

const config = require('../config.json')

// 오늘 날짜
const today = new Date().toISOString().split('T')[0]

// 히스토리 파일 경로
const historyDir = path.join(process.cwd(), config.output.app_trends_dir || 'generated/app-trends')
const historyPath = path.join(historyDir, 'history.json')

// 히스토리 로드
function loadHistory() {
  if (!fs.existsSync(historyPath)) {
    return {
      apps: {},
      last_updated: null
    }
  }
  return JSON.parse(fs.readFileSync(historyPath, 'utf8'))
}

// 히스토리 저장
function saveHistory(history) {
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true })
  }
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2))
}

// 오래된 히스토리 정리 (90일 초과분 삭제)
function cleanOldHistory(history) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90)
  const cutoffStr = cutoffDate.toISOString().split('T')[0]

  for (const appId of Object.keys(history.apps)) {
    const app = history.apps[appId]
    app.history = app.history.filter(h => h.date >= cutoffStr)

    // 히스토리가 비어있으면 앱 삭제
    if (app.history.length === 0) {
      delete history.apps[appId]
    }
  }

  return history
}

// 오늘의 소스 데이터 로드
function loadTodayData() {
  const sourcesDir = path.join(process.cwd(), config.output.sources_dir || 'generated/sources')
  const todayFile = path.join(sourcesDir, `${today}.json`)

  if (!fs.existsSync(todayFile)) {
    console.log(`  ⚠️  Today's data not found: ${todayFile}`)
    return null
  }

  return JSON.parse(fs.readFileSync(todayFile, 'utf8'))
}

// 히스토리 업데이트
function updateHistory(history, todayData) {
  const sources = ['playstore_niche', 'appstore_niche']

  for (const source of sources) {
    const sourceData = todayData.sources?.[source]
    if (!sourceData || !sourceData.items) continue

    for (const app of sourceData.items) {
      const appId = app.id

      if (!history.apps[appId]) {
        // 새 앱
        history.apps[appId] = {
          id: appId,
          title: app.title,
          developer: app.developer,
          platform: app.platform,
          url: app.url,
          history: []
        }
      }

      // 오늘 데이터가 이미 있는지 확인
      const existingToday = history.apps[appId].history.find(h => h.date === today)
      if (existingToday) continue

      // 오늘 데이터 추가 (맨 앞에)
      history.apps[appId].history.unshift({
        date: today,
        rank: app.rank,
        category: app.category,
        collection: app.collection,
        country: app.country,
        reviews: app.reviews,
        score: app.score,
        nicheScore: app.nicheScore
      })

      // 메타데이터 업데이트
      history.apps[appId].title = app.title
      history.apps[appId].developer = app.developer
      history.apps[appId].url = app.url
    }
  }

  history.last_updated = new Date().toISOString()
  return history
}

// 앱 트렌드 분석
function analyzeAppTrends(history) {
  const results = {
    rising: [],        // 급상승 (전일 대비 +10위 이상)
    newEntries: [],    // 신규 진입 (어제 없던 앱)
    consistent: [],    // 꾸준히 상승 (3일 연속 상승)
    falling: [],       // 하락 중
    summary: {
      total_tracked: Object.keys(history.apps).length,
      rising_count: 0,
      new_entries_count: 0,
      consistent_count: 0,
      falling_count: 0
    }
  }

  for (const [appId, app] of Object.entries(history.apps)) {
    if (!app.history || app.history.length === 0) continue

    const todayData = app.history[0]
    const yesterdayData = app.history[1]

    // 오늘 데이터가 아니면 스킵
    if (todayData.date !== today) continue

    const appInfo = {
      id: appId,
      title: app.title,
      developer: app.developer,
      platform: app.platform,
      url: app.url,
      category: todayData.category,
      collection: todayData.collection,
      country: todayData.country,
      todayRank: todayData.rank,
      todayScore: todayData.score,
      todayReviews: todayData.reviews,
      nicheScore: todayData.nicheScore
    }

    if (!yesterdayData || yesterdayData.date !== getYesterdayDate()) {
      // 신규 진입
      results.newEntries.push({
        ...appInfo,
        change: 'NEW'
      })
      continue
    }

    const rankChange = yesterdayData.rank - todayData.rank  // 양수 = 상승

    appInfo.yesterdayRank = yesterdayData.rank
    appInfo.rankChange = rankChange

    if (rankChange >= 10) {
      results.rising.push(appInfo)
    } else if (rankChange <= -10) {
      results.falling.push(appInfo)
    }

    // 3일 연속 상승 체크
    if (app.history.length >= 3) {
      let isConsistent = true
      for (let i = 0; i < 2; i++) {
        if (!app.history[i + 1]) {
          isConsistent = false
          break
        }
        if (app.history[i].rank >= app.history[i + 1].rank) {
          isConsistent = false
          break
        }
      }
      if (isConsistent) {
        results.consistent.push({
          ...appInfo,
          streak: 3,
          totalRise: app.history[2].rank - app.history[0].rank
        })
      }
    }
  }

  // 정렬
  results.rising.sort((a, b) => b.rankChange - a.rankChange)
  results.falling.sort((a, b) => a.rankChange - b.rankChange)
  results.newEntries.sort((a, b) => a.todayRank - b.todayRank)
  results.consistent.sort((a, b) => b.totalRise - a.totalRise)

  // 요약 업데이트
  results.summary.rising_count = results.rising.length
  results.summary.new_entries_count = results.newEntries.length
  results.summary.consistent_count = results.consistent.length
  results.summary.falling_count = results.falling.length

  return results
}

// 어제 날짜 구하기
function getYesterdayDate() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// 분석 결과 저장
function saveAnalysisResults(results) {
  const outputPath = path.join(historyDir, `analysis-${today}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`  💾 Analysis saved to: ${outputPath}`)
}

// 메인 실행
async function main() {
  console.log(`\n📱 App Trends Analysis - ${today}\n`)
  console.log('='.repeat(50))

  // 1. 오늘 데이터 로드
  console.log('📥 Loading today\'s data...')
  const todayData = loadTodayData()
  if (!todayData) {
    console.log('❌ No data to analyze. Run collect-data.js first.')
    process.exit(1)
  }

  // 2. 히스토리 로드
  console.log('📚 Loading history...')
  let history = loadHistory()
  const prevCount = Object.keys(history.apps).length

  // 3. 히스토리 업데이트
  console.log('📝 Updating history...')
  history = updateHistory(history, todayData)
  const newCount = Object.keys(history.apps).length
  console.log(`  Apps tracked: ${prevCount} → ${newCount}`)

  // 4. 오래된 데이터 정리
  console.log('🧹 Cleaning old history (>90 days)...')
  history = cleanOldHistory(history)

  // 5. 히스토리 저장
  console.log('💾 Saving history...')
  saveHistory(history)

  // 6. 트렌드 분석
  console.log('📊 Analyzing trends...')
  const results = analyzeAppTrends(history)

  // 6.5 피처 이력 어노테이션
  console.log('📝 Annotating featured status...')
  const featuredPath = path.join(historyDir, 'featured-apps.json')
  let featuredData = { featured: {} }
  if (fs.existsSync(featuredPath)) {
    featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString().split('T')[0]

  const annotate = (apps) => {
    for (const app of apps) {
      const feat = featuredData.featured[app.id]
      if (feat && feat.last_featured >= cutoff) {
        app.recently_featured = true
        app.last_featured_date = feat.last_featured
        app.feature_count = feat.feature_count
      } else {
        app.recently_featured = false
      }
    }
  }

  annotate(results.rising || [])
  annotate(results.newEntries || [])
  annotate(results.consistent || [])
  annotate(results.falling || [])

  const recentlyFeaturedCount = [
    ...results.rising || [],
    ...results.newEntries || [],
    ...results.consistent || []
  ].filter(a => a.recently_featured).length
  console.log(`  Recently featured (skip in analysis): ${recentlyFeaturedCount}`)

  // 7. 결과 저장
  saveAnalysisResults(results)

  // 8. 요약 출력
  console.log('\n' + '='.repeat(50))
  console.log('📊 Analysis Summary:')
  console.log(`  - Total apps tracked: ${results.summary.total_tracked}`)
  console.log(`  - Rising apps (+10 ranks): ${results.summary.rising_count}`)
  console.log(`  - New entries: ${results.summary.new_entries_count}`)
  console.log(`  - Consistent risers (3-day): ${results.summary.consistent_count}`)
  console.log(`  - Falling apps (-10 ranks): ${results.summary.falling_count}`)

  if (results.rising.length > 0) {
    console.log('\n🚀 Top Rising Apps:')
    results.rising.slice(0, 5).forEach((app, i) => {
      console.log(`  ${i + 1}. ${app.title} (${app.platform}) +${app.rankChange} ranks`)
    })
  }

  if (results.newEntries.length > 0) {
    console.log('\n🆕 New Entries:')
    results.newEntries.slice(0, 5).forEach((app, i) => {
      console.log(`  ${i + 1}. ${app.title} (${app.platform}) #${app.todayRank}`)
    })
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Analysis complete!\n')

  return results
}

// 실행
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  })
