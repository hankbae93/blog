#!/usr/bin/env node

/**
 * App Review Collector
 * 특정 앱의 리뷰를 수집하고 페인포인트 분석용 데이터를 생성
 *
 * Usage:
 *   node scripts/collect-reviews.js "Instagram"
 *   node scripts/collect-reviews.js "https://play.google.com/store/apps/details?id=com.instagram.android"
 *   node scripts/collect-reviews.js "https://apps.apple.com/us/app/instagram/id389801252"
 */

const fs = require('fs')
const path = require('path')

// App Store Scrapers
let gplay, appStore
try {
  const gplayModule = require('google-play-scraper')
  gplay = gplayModule.default || gplayModule
  appStore = require('app-store-scraper')
} catch (e) {
  console.error('App store scrapers not installed. Run: npm install google-play-scraper app-store-scraper')
  process.exit(1)
}

const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ─── 입력 파싱 ───────────────────────────────────────────────

function parseInput(input) {
  // Play Store URL
  if (input.includes('play.google.com')) {
    const url = new URL(input)
    const appId = url.searchParams.get('id')
    if (!appId) throw new Error('Play Store URL에서 앱 ID를 찾을 수 없습니다')
    return { type: 'playstore-url', appId }
  }

  // App Store URL
  if (input.includes('apps.apple.com')) {
    const match = input.match(/\/id(\d+)/)
    if (!match) throw new Error('App Store URL에서 앱 ID를 찾을 수 없습니다')
    const country = input.match(/apps\.apple\.com\/([a-z]{2})\//)?.[1] || 'us'
    return { type: 'appstore-url', id: match[1], country }
  }

  // 앱 이름 검색
  return { type: 'search', term: input }
}

// ─── 앱 정보 조회 ─────────────────────────────────────────────

async function resolvePlayStoreApp(parsed) {
  if (parsed.type === 'playstore-url') {
    const detail = await gplay.app({ appId: parsed.appId, lang: 'en' })
    return detail
  }
  // 검색
  const results = await gplay.search({ term: parsed.term, num: 5, lang: 'en' })
  if (results.length === 0) return null
  const detail = await gplay.app({ appId: results[0].appId, lang: 'en' })
  return detail
}

async function resolveAppStoreApp(parsed) {
  if (parsed.type === 'appstore-url') {
    const detail = await appStore.app({ id: parseInt(parsed.id), country: parsed.country || 'us' })
    return detail
  }
  // 검색
  const results = await appStore.search({ term: parsed.term, num: 5, country: 'us' })
  if (results.length === 0) return null
  return results[0]
}

// ─── 리뷰 수집 ────────────────────────────────────────────────

async function collectPlayStoreReviews(appId) {
  const allReviews = new Map()

  // 1. 최근 리뷰 50개
  try {
    const recent = await gplay.reviews({ appId, sort: gplay.sort.NEWEST, num: 50, lang: 'en' })
    const data = recent.data || recent
    data.forEach(r => allReviews.set(r.id, { ...r, source: 'recent' }))
    console.log(`    최근 리뷰: ${data.length}개`)
  } catch (e) {
    console.log(`    ⚠️  최근 리뷰 수집 실패: ${e.message}`)
  }

  await delay(500)

  // 2. 추천순 리뷰 (상위 + 부정)
  try {
    const helpful = await gplay.reviews({ appId, sort: gplay.sort.HELPFULNESS, num: 100, lang: 'en' })
    const data = helpful.data || helpful

    // 상위 추천 10개
    data.slice(0, 10).forEach(r => {
      if (!allReviews.has(r.id)) allReviews.set(r.id, { ...r, source: 'helpful_positive' })
    })

    // 추천 많은 부정 리뷰 10개
    const negativeHelpful = data
      .filter(r => r.score <= 2)
      .sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))
      .slice(0, 10)
    negativeHelpful.forEach(r => {
      if (!allReviews.has(r.id)) allReviews.set(r.id, { ...r, source: 'helpful_negative' })
    })

    console.log(`    추천순 리뷰: 상위 ${Math.min(10, data.length)}개, 부정 ${negativeHelpful.length}개`)
  } catch (e) {
    console.log(`    ⚠️  추천순 리뷰 수집 실패: ${e.message}`)
  }

  return Array.from(allReviews.values())
}

async function collectAppStoreReviews(appId, country = 'us') {
  const allReviews = new Map()

  // App Store 리뷰는 iTunes RSS API를 사용하는데, Apple이 이 API를 제한/폐기한 경우가 있음
  // 여러 페이지를 시도하여 최대한 수집

  for (const sortType of [appStore.sort.RECENT, appStore.sort.HELPFUL]) {
    for (let page = 1; page <= 3; page++) {
      try {
        const reviews = await appStore.reviews({ id: parseInt(appId), sort: sortType, page, country })
        if (reviews.length === 0) break

        const source = sortType === appStore.sort.RECENT ? 'recent' : 'helpful_positive'
        reviews.forEach(r => {
          if (!allReviews.has(r.id)) {
            // 부정 리뷰이면서 추천순이면 helpful_negative로 분류
            const actualSource = (source === 'helpful_positive' && r.score <= 2) ? 'helpful_negative' : source
            allReviews.set(r.id, { ...r, source: actualSource })
          }
        })

        console.log(`    ${sortType} 페이지 ${page}: ${reviews.length}개`)
        await delay(300)
      } catch (e) {
        // RSS API가 비활성화된 경우 조용히 넘어감
        break
      }
    }
  }

  if (allReviews.size === 0) {
    console.log('    ⚠️  App Store 리뷰를 가져올 수 없습니다 (Apple RSS API 제한)')
  }

  return Array.from(allReviews.values())
}

// ─── 분석 기능 ────────────────────────────────────────────────

function enhancedClusterComplaints(reviews) {
  const themes = {
    'crash/bugs': { keywords: ['crash', 'bug', 'error', 'freeze', 'stuck', 'broken', 'glitch', 'not working', 'doesnt work', "doesn't work"], count: 0, samples: [] },
    'slow/performance': { keywords: ['slow', 'lag', 'loading', 'performance', 'battery', 'drain', 'heavy', 'memory', 'hang'], count: 0, samples: [] },
    'ui/ux issues': { keywords: ['confusing', 'hard to use', 'interface', 'layout', 'navigate', 'unintuitive', 'cluttered', 'ugly', 'design', 'complicated'], count: 0, samples: [] },
    'missing features': { keywords: ['missing', 'need', 'wish', 'should', 'feature', 'option', 'support', 'add', 'want', 'lack', 'doesnt have'], count: 0, samples: [] },
    'pricing/subscription': { keywords: ['expensive', 'price', 'subscription', 'pay', 'cost', 'free', 'premium', 'money', 'paywall', 'overpriced', 'ripoff'], count: 0, samples: [] },
    'ads': { keywords: ['ad', 'ads', 'advertisement', 'popup', 'banner', 'spam', 'intrusive'], count: 0, samples: [] },
    'sync/data': { keywords: ['sync', 'data', 'backup', 'export', 'import', 'lost', 'save', 'cloud', 'transfer', 'restore'], count: 0, samples: [] },
    'notifications': { keywords: ['notification', 'alert', 'remind', 'push', 'annoying', 'spam notification'], count: 0, samples: [] },
    'login/auth': { keywords: ['login', 'password', 'authentication', 'sign in', 'account', 'verify', 'verification', 'locked out', '2fa', 'otp'], count: 0, samples: [] },
    'updates/changes': { keywords: ['update', 'changed', 'removed', 'worse', 'downgrade', 'rollback', 'version', 'old version', 'bring back', 'used to'], count: 0, samples: [] }
  }

  for (const review of reviews) {
    const text = (review.text || review.content || review.title || '').toLowerCase()
    if (!text) continue

    for (const [theme, data] of Object.entries(themes)) {
      if (data.keywords.some(k => text.includes(k))) {
        data.count++
        if (data.samples.length < 3) {
          data.samples.push({
            score: review.score,
            text: (review.text || review.content || review.title || '').slice(0, 400),
            thumbsUp: review.thumbsUp || review.vote || 0,
            date: review.date || review.updated || null
          })
        }
      }
    }
  }

  return Object.entries(themes)
    .filter(([, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([theme, data]) => ({
      theme,
      count: data.count,
      percentage: 0, // 나중에 계산
      samples: data.samples
    }))
}

function extractFeatureRequests(reviews) {
  const requestKeywords = ['wish', 'need', 'please add', 'would be nice', 'feature request', 'hope they', 'want', 'should have', 'should add', 'should be able', 'it would be great', 'would love']
  const requests = []

  for (const review of reviews) {
    const text = (review.text || review.content || review.title || '').toLowerCase()
    if (!text) continue

    if (requestKeywords.some(k => text.includes(k))) {
      requests.push({
        score: review.score,
        text: (review.text || review.content || review.title || '').slice(0, 500),
        thumbsUp: review.thumbsUp || review.vote || 0,
        date: review.date || review.updated || null
      })
    }
  }

  return requests.sort((a, b) => (b.thumbsUp || 0) - (a.thumbsUp || 0))
}

function extractCompetitorMentions(reviews) {
  const patterns = [
    /switch(?:ed|ing)?\s+to\s+(\w[\w\s]*\w)/gi,
    /better\s+than\s+(\w[\w\s]*\w)/gi,
    /use\s+(\w[\w\s]*\w)\s+instead/gi,
    /compared\s+to\s+(\w[\w\s]*\w)/gi,
    /like\s+(\w[\w\s]*\w)\s+but/gi,
    /moved?\s+to\s+(\w[\w\s]*\w)/gi,
    /prefer\s+(\w[\w\s]*\w)/gi,
    /(\w[\w\s]*\w)\s+is\s+(?:much\s+)?better/gi
  ]

  const mentions = {}
  const stopWords = new Set(['this', 'that', 'the', 'app', 'it', 'i', 'my', 'a', 'an', 'some', 'other', 'another', 'what', 'which', 'their', 'they', 'you', 'your', 'one', 'something'])

  for (const review of reviews) {
    const text = review.text || review.content || review.title || ''
    if (!text) continue

    for (const pattern of patterns) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim()
        if (name.length < 3 || name.length > 30) continue
        if (stopWords.has(name.toLowerCase())) continue

        if (!mentions[name]) {
          mentions[name] = { count: 0, contexts: [] }
        }
        mentions[name].count++
        if (mentions[name].contexts.length < 2) {
          mentions[name].contexts.push(text.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50))
        }
      }
    }
  }

  return Object.entries(mentions)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([name, data]) => ({
      competitor: name,
      count: data.count,
      contexts: data.contexts
    }))
}

function buildSentimentTimeline(reviews) {
  const monthly = {}

  for (const review of reviews) {
    const date = review.date || review.updated
    if (!date) continue

    const d = new Date(date)
    if (isNaN(d.getTime())) continue

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthly[key]) {
      monthly[key] = { totalScore: 0, count: 0 }
    }
    monthly[key].totalScore += review.score
    monthly[key].count++
  }

  return Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      avgScore: Math.round((data.totalScore / data.count) * 100) / 100,
      reviewCount: data.count
    }))
}

// ─── 메인 ─────────────────────────────────────────────────────

async function main() {
  const input = process.argv.slice(2).join(' ').trim()
  if (!input) {
    console.error('Usage: node scripts/collect-reviews.js "<앱 이름 또는 URL>"')
    process.exit(1)
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log('           APP REVIEW COLLECTOR')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  입력: ${input}`)
  console.log(`  날짜: ${today}`)
  console.log('')

  const parsed = parseInput(input)
  const results = { platforms: [] }

  // ─── Play Store ───
  if (parsed.type !== 'appstore-url') {
    console.log('  [Play Store] 앱 조회 중...')
    try {
      const app = await resolvePlayStoreApp(parsed)
      if (app) {
        console.log(`    ✓ ${app.title} (${app.appId})`)
        console.log(`    ⭐ ${app.score} | 리뷰 ${app.reviews?.toLocaleString() || 'N/A'}개 | ${app.genre || app.category}`)
        console.log('    리뷰 수집 중...')

        const reviews = await collectPlayStoreReviews(app.appId)
        const painPoints = enhancedClusterComplaints(reviews)
        const totalComplaints = painPoints.reduce((sum, p) => sum + p.count, 0)
        painPoints.forEach(p => { p.percentage = totalComplaints > 0 ? Math.round((p.count / totalComplaints) * 100) : 0 })

        results.platforms.push({
          platform: 'android',
          meta: {
            appName: app.title,
            appId: app.appId,
            rating: app.score,
            totalReviews: app.reviews || 0,
            category: app.genre || app.category || '',
            developer: app.developer || '',
            icon: app.icon || '',
            url: app.url || `https://play.google.com/store/apps/details?id=${app.appId}`,
            installs: app.installs || '',
            description: (app.description || '').slice(0, 500)
          },
          reviews: {
            total: reviews.length,
            recent: reviews.filter(r => r.source === 'recent').map(formatReview),
            helpful_positive: reviews.filter(r => r.source === 'helpful_positive').map(formatReview),
            helpful_negative: reviews.filter(r => r.source === 'helpful_negative').map(formatReview)
          },
          analysis: {
            painPoints,
            featureRequests: extractFeatureRequests(reviews),
            competitorMentions: extractCompetitorMentions(reviews),
            sentimentTimeline: buildSentimentTimeline(reviews)
          }
        })

        console.log(`    ✓ 총 ${reviews.length}개 리뷰 수집 완료`)
        console.log(`    ✓ 페인포인트 ${painPoints.length}개 카테고리 감지`)
      } else {
        console.log('    ⚠️  Play Store에서 앱을 찾을 수 없습니다')
      }
    } catch (e) {
      console.log(`    ⚠️  Play Store 오류: ${e.message}`)
    }
  }

  await delay(500)

  // ─── App Store ───
  if (parsed.type !== 'playstore-url') {
    console.log('  [App Store] 앱 조회 중...')
    try {
      const app = await resolveAppStoreApp(parsed)
      if (app) {
        console.log(`    ✓ ${app.title} (${app.id})`)
        console.log(`    ⭐ ${app.score} | 리뷰 ${app.reviews?.toLocaleString() || 'N/A'}개 | ${app.primaryGenre || app.genre || ''}`)
        console.log('    리뷰 수집 중...')

        const reviews = await collectAppStoreReviews(app.id, parsed.country)
        if (reviews.length === 0) {
          console.log('    ⚠️  리뷰 수집 결과 없음, App Store 분석 건너뜀')
          throw new Error('No reviews collected')
        }
        const painPoints = enhancedClusterComplaints(reviews)
        const totalComplaints = painPoints.reduce((sum, p) => sum + p.count, 0)
        painPoints.forEach(p => { p.percentage = totalComplaints > 0 ? Math.round((p.count / totalComplaints) * 100) : 0 })

        results.platforms.push({
          platform: 'ios',
          meta: {
            appName: app.title,
            appId: String(app.id),
            rating: app.score,
            totalReviews: app.reviews || app.ratings || 0,
            category: app.primaryGenre || app.genre || '',
            developer: app.developer || '',
            icon: app.icon || '',
            url: app.url || '',
            description: (app.description || '').slice(0, 500)
          },
          reviews: {
            total: reviews.length,
            recent: reviews.filter(r => r.source === 'recent').map(formatReview),
            helpful_positive: reviews.filter(r => r.source === 'helpful_positive').map(formatReview),
            helpful_negative: reviews.filter(r => r.source === 'helpful_negative').map(formatReview)
          },
          analysis: {
            painPoints,
            featureRequests: extractFeatureRequests(reviews),
            competitorMentions: extractCompetitorMentions(reviews),
            sentimentTimeline: buildSentimentTimeline(reviews)
          }
        })

        console.log(`    ✓ 총 ${reviews.length}개 리뷰 수집 완료`)
        console.log(`    ✓ 페인포인트 ${painPoints.length}개 카테고리 감지`)
      } else {
        console.log('    ⚠️  App Store에서 앱을 찾을 수 없습니다')
      }
    } catch (e) {
      console.log(`    ⚠️  App Store 오류: ${e.message}`)
    }
  }

  // ─── 결과 저장 ───
  if (results.platforms.length === 0) {
    console.error('\n  ❌ 어떤 플랫폼에서도 앱을 찾지 못했습니다')
    process.exit(1)
  }

  const appName = results.platforms[0].meta.appName
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const outputDir = path.join(process.cwd(), 'generated', 'review-analysis')
  fs.mkdirSync(outputDir, { recursive: true })

  const output = {
    collectedAt: new Date().toISOString(),
    date: today,
    appName,
    slug,
    ...results
  }

  const outputPath = path.join(outputDir, `${slug}-${today}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8')

  console.log('')
  console.log('═══════════════════════════════════════════════════════')
  console.log('                    COMPLETE')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  📄 ${outputPath}`)
  console.log(`  📊 플랫폼: ${results.platforms.map(p => p.platform).join(', ')}`)
  console.log(`  📝 총 리뷰: ${results.platforms.reduce((sum, p) => sum + p.reviews.total, 0)}개`)
  console.log('═══════════════════════════════════════════════════════')
}

function formatReview(review) {
  return {
    id: review.id,
    score: review.score,
    text: (review.text || review.content || '').slice(0, 500),
    title: review.title || '',
    thumbsUp: review.thumbsUp || review.vote || 0,
    date: review.date || review.updated || null,
    userName: review.userName || '',
    version: review.version || ''
  }
}

main().catch(e => {
  console.error(`\n  ❌ 오류: ${e.message}`)
  process.exit(1)
})
