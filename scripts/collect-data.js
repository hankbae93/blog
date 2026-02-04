#!/usr/bin/env node

/**
 * PRD-Agent Data Collector
 * 9개 소스에서 트렌드 데이터를 수집하여 JSON 파일로 저장
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

// 환경변수 로드
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  }
}

loadEnv()

const config = require('../config.json')

// App Store Scrapers
let gplay, appStore
try {
  const gplayModule = require('google-play-scraper')
  gplay = gplayModule.default || gplayModule
  appStore = require('app-store-scraper')
} catch (e) {
  console.log('⚠️  App store scrapers not installed. Run: npm install google-play-scraper app-store-scraper')
}

// 오늘 날짜
const today = new Date().toISOString().split('T')[0]

// HTTP/HTTPS 요청 헬퍼
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const protocol = urlObj.protocol === 'https:' ? https : require('http')

    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 30000
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

// Product Hunt GraphQL API
async function collectProductHunt() {
  const token = process.env.PRODUCTHUNT_ACCESS_TOKEN
  if (!token) {
    console.log('  ⚠️  PRODUCTHUNT_ACCESS_TOKEN not set, skipping...')
    return { status: 'skipped', items: [] }
  }

  const query = `{
    posts(first: 10) {
      edges {
        node {
          id
          name
          slug
          tagline
          description
          url
          website
          votesCount
          commentsCount
          reviewsRating
          createdAt
          featuredAt
          topics { edges { node { name } } }
          makers { id name headline twitterUsername }
          thumbnail { url }
        }
      }
    }
  }`

  try {
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })

    const json = JSON.parse(res.data)
    const items = json.data?.posts?.edges?.map(e => ({
      id: e.node.id,
      name: e.node.name,
      slug: e.node.slug,
      tagline: e.node.tagline,
      description: e.node.description,
      url: e.node.url,
      website: e.node.website,
      votesCount: e.node.votesCount,
      commentsCount: e.node.commentsCount,
      reviewsRating: e.node.reviewsRating,
      createdAt: e.node.createdAt,
      featuredAt: e.node.featuredAt,
      topics: e.node.topics?.edges?.map(t => t.node.name) || [],
      makers: e.node.makers || [],
      thumbnail: e.node.thumbnail?.url
    })) || []

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ Product Hunt error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Hacker News API
async function collectHackerNews() {
  try {
    const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const topIds = JSON.parse(topStoriesRes.data).slice(0, 15)

    const items = []
    for (const id of topIds) {
      try {
        const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        const story = JSON.parse(storyRes.data)
        if (story && story.title) {
          items.push({
            title: story.title,
            url: story.url || `https://news.ycombinator.com/item?id=${id}`,
            points: story.score || 0,
            comments: story.descendants || 0,
            author: story.by,
            time: story.time
          })
        }
      } catch (e) {
        // Skip individual story errors
      }
    }

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ Hacker News error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// GitHub Trending (gh CLI 사용)
async function collectGitHubTrending() {
  try {
    // gh CLI로 최근 인기 저장소 검색 (updated:최근 7일, stars 순)
    const { execSync } = require('child_process')
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const result = execSync(
      `gh search repos --updated=">=${sevenDaysAgo}" --sort=stars --order=desc --limit=15 --json fullName,description,language,stargazersCount,url`,
      { encoding: 'utf8', timeout: 30000 }
    )

    const repos = JSON.parse(result)
    const items = repos.map(repo => ({
      name: repo.fullName,
      description: repo.description || '',
      language: repo.language || 'Unknown',
      stars_today: 0,
      total_stars: repo.stargazersCount || 0,
      url: repo.url || `https://github.com/${repo.fullName}`
    }))

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ GitHub Trending error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// YouTube 개발자/프로그래밍 콘텐츠 검색 (Search API)
async function collectYouTubeTrending() {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.log('  ⚠️  YOUTUBE_API_KEY not set, skipping...')
    return { status: 'skipped', items: [] }
  }

  // 개발자 친화적 검색 키워드
  const searchQueries = [
    { query: 'programming tutorial 2026', region: 'US', label: 'Programming' },
    { query: 'coding project', region: 'US', label: 'Coding' },
    { query: 'software development', region: 'US', label: 'Software Dev' },
    { query: 'web development react', region: 'US', label: 'Web Dev' },
    { query: '개발자 코딩', region: 'KR', label: '한국 개발' },
    { query: '프로그래밍 튜토리얼', region: 'KR', label: '한국 튜토리얼' }
  ]
  const maxResultsPerQuery = 5

  // 채널 구독자 수 캐시
  const channelCache = new Map()

  async function getChannelSubscribers(channelId) {
    if (channelCache.has(channelId)) {
      return channelCache.get(channelId)
    }
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
      const res = await fetch(url)
      const data = JSON.parse(res.data)
      const subscriberCount = parseInt(data.items?.[0]?.statistics?.subscriberCount || 0)
      channelCache.set(channelId, subscriberCount)
      return subscriberCount
    } catch (e) {
      channelCache.set(channelId, 0)
      return 0
    }
  }

  function parseDuration(isoDuration) {
    if (!isoDuration) return null
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return isoDuration
    const hours = parseInt(match[1] || 0)
    const minutes = parseInt(match[2] || 0)
    const seconds = parseInt(match[3] || 0)
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const allItems = []
  const seenVideoIds = new Set()

  for (const sq of searchQueries) {
    try {
      // Search API로 최근 인기 영상 검색
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(sq.query)}&type=video&order=viewCount&publishedAfter=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&regionCode=${sq.region}&maxResults=${maxResultsPerQuery}&key=${apiKey}`
      const searchRes = await fetch(searchUrl)
      const searchData = JSON.parse(searchRes.data)

      const videoIds = (searchData.items || [])
        .map(item => item.id?.videoId)
        .filter(id => id && !seenVideoIds.has(id))

      if (videoIds.length === 0) continue

      // 비디오 상세 정보 조회
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`
      const videoRes = await fetch(videoUrl)
      const videoData = JSON.parse(videoRes.data)

      for (const video of (videoData.items || [])) {
        if (seenVideoIds.has(video.id)) continue
        seenVideoIds.add(video.id)

        const channelSubscribers = await getChannelSubscribers(video.snippet.channelId)
        const views = parseInt(video.statistics?.viewCount || 0)
        const likes = parseInt(video.statistics?.likeCount || 0)

        allItems.push({
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          channelId: video.snippet.channelId,
          channelSubscribers: channelSubscribers,
          videoId: video.id,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnail: video.snippet.thumbnails?.maxres?.url
            || video.snippet.thumbnails?.high?.url
            || video.snippet.thumbnails?.medium?.url,
          views: views,
          likes: likes,
          likeRatio: views > 0 ? ((likes / views) * 100).toFixed(2) : 0,
          commentCount: parseInt(video.statistics?.commentCount || 0),
          duration: parseDuration(video.contentDetails?.duration),
          durationRaw: video.contentDetails?.duration,
          definition: video.contentDetails?.definition,
          publishedAt: video.snippet.publishedAt,
          category: sq.label,
          region: sq.region,
          tags: video.snippet.tags?.slice(0, 5) || []
        })
      }
    } catch (e) {
      console.log(`  ⚠️  YouTube "${sq.query}": ${e.message}`)
    }
  }

  // 조회수 순으로 정렬
  allItems.sort((a, b) => b.views - a.views)

  return {
    status: allItems.length > 0 ? 'success' : 'failed',
    items: allItems.slice(0, 20)  // 최대 20개
  }
}

// GeekNews (Korean tech news)
async function collectGeekNews() {
  try {
    // GeekNews doesn't have public API, use RSS or scraping fallback
    const res = await fetch('https://news.hada.io/new')
    // Basic extraction from HTML (simplified)
    const html = res.data
    const items = []

    // Extract titles and URLs using regex (basic scraping)
    const matches = html.matchAll(/<a[^>]*href="(\/topic[^"]+)"[^>]*>([^<]+)<\/a>/g)
    let count = 0
    for (const match of matches) {
      if (count >= 10) break
      items.push({
        title: match[2].trim(),
        url: `https://news.hada.io${match[1]}`,
        points: 0,
        comments: 0
      })
      count++
    }

    return { status: items.length > 0 ? 'success' : 'partial', items }
  } catch (error) {
    console.log(`  ❌ GeekNews error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Dev.to API
async function collectDevTo() {
  try {
    const res = await fetch('https://dev.to/api/articles?per_page=10&top=1')
    const articles = JSON.parse(res.data)

    const items = articles.map(article => ({
      title: article.title,
      author: article.user?.username || 'unknown',
      url: article.url,
      reactions: article.positive_reactions_count || 0,
      comments: article.comments_count || 0,
      tags: article.tag_list || [],
      published_at: article.published_at
    }))

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ Dev.to error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Lobsters
async function collectLobsters() {
  try {
    const res = await fetch('https://lobste.rs/hottest.json')
    const stories = JSON.parse(res.data).slice(0, 10)

    const items = stories.map(story => ({
      title: story.title,
      url: story.url || story.comments_url,
      points: story.score || 0,
      comments: story.comment_count || 0,
      tags: story.tags || [],
      author: story.submitter_user
    }))

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ Lobsters error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Indie Hackers (no public API, simplified)
async function collectIndieHackers() {
  try {
    // Indie Hackers doesn't have public API
    // Return placeholder - will be filled by Claude Code's WebFetch
    return {
      status: 'partial',
      note: 'No public API - requires WebFetch crawling',
      items: []
    }
  } catch (error) {
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Google Trends 급상승 검색어 (RSS 피드)
async function collectGoogleTrends() {
  try {
    const res = await fetch('https://trends.google.co.kr/trending/rss?geo=KR')
    const xml = res.data

    const items = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    let count = 0
    for (const match of itemMatches) {
      if (count >= 20) break
      const itemXml = match[1]

      // 제목 추출
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                         itemXml.match(/<title>(.*?)<\/title>/)

      // 트래픽 수치 추출
      const trafficMatch = itemXml.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)

      // 관련 뉴스 추출
      const newsItems = []
      const newsMatches = itemXml.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)
      for (const newsMatch of newsMatches) {
        const newsXml = newsMatch[1]
        const newsTitleMatch = newsXml.match(/<ht:news_item_title><!\[CDATA\[(.*?)\]\]><\/ht:news_item_title>/) ||
                               newsXml.match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)
        const newsUrlMatch = newsXml.match(/<ht:news_item_url><!\[CDATA\[(.*?)\]\]><\/ht:news_item_url>/) ||
                             newsXml.match(/<ht:news_item_url>(.*?)<\/ht:news_item_url>/)
        if (newsTitleMatch && newsUrlMatch) {
          newsItems.push({
            title: newsTitleMatch[1],
            url: newsUrlMatch[1]
          })
        }
      }

      // 관련 검색어 추출 (picture 태그에서)
      const relatedQueries = []
      const pictureMatch = itemXml.match(/<ht:picture>(.*?)<\/ht:picture>/)

      if (titleMatch) {
        items.push({
          title: titleMatch[1],
          traffic: trafficMatch ? trafficMatch[1] : 'N/A',
          related_queries: relatedQueries,
          news_items: newsItems.slice(0, 3)  // 최대 3개 뉴스
        })
        count++
      }
    }

    return { status: items.length > 0 ? 'success' : 'partial', items }
  } catch (error) {
    console.log(`  ❌ Google Trends error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// Naver Trends 급상승 검색어 (Zum 실시간 검색어 활용)
async function collectNaverTrends() {
  try {
    // Naver 실시간 검색어는 공식 API가 없고, 2021년부터 서비스 종료됨
    // 대안으로 Zum 실시간 검색어 또는 네이버 쇼핑인사이트 활용

    const items = []

    // 1. Zum 실시간 검색어 시도
    try {
      const zumRes = await fetch('https://zum.com/')
      const zumHtml = zumRes.data

      // Zum 페이지에서 실시간 검색어 추출
      const keywordMatches = zumHtml.matchAll(/<span[^>]*class="[^"]*keyword[^"]*"[^>]*>([^<]+)<\/span>/gi) ||
                             zumHtml.matchAll(/<a[^>]*class="[^"]*rank[^"]*"[^>]*>([^<]+)<\/a>/gi)

      let rank = 1
      for (const match of keywordMatches) {
        if (rank > 20) break
        const keyword = match[1].trim()
        if (keyword && keyword.length > 1 && !/^\d+$/.test(keyword)) {
          items.push({
            rank: rank++,
            title: keyword,
            change: 'same',
            category: ''
          })
        }
      }
    } catch (e) {
      // Zum 실패 시 무시
    }

    // 2. Naver 쇼핑인사이트 인기검색어 시도 (대체)
    if (items.length === 0) {
      try {
        const shoppingRes = await fetch('https://datalab.naver.com/shoppingInsight/sCategory.naver')
        // 쇼핑 카테고리 인기 검색어 추출 시도
      } catch (e) {
        // 실패 시 무시
      }
    }

    // 3. Naver DataLab API 시도 (환경변수 있는 경우)
    if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
      try {
        // Naver 검색어 트렌드 API - 특정 키워드의 검색량 추이 확인용
        // 실시간 급상승 검색어는 제공하지 않지만, 관심 키워드 모니터링 가능
        console.log('  ℹ️  Naver API available for keyword trend analysis')
      } catch (e) {
        // API 호출 실패
      }
    }

    return {
      status: items.length > 0 ? 'success' : 'partial',
      items,
      note: items.length === 0 ? 'Naver retired real-time trending in 2021. Using alternative sources.' : undefined
    }
  } catch (error) {
    console.log(`  ❌ Naver Trends error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// TechCrunch RSS
async function collectTechCrunch() {
  try {
    const res = await fetch('https://techcrunch.com/feed/')
    const xml = res.data

    // Basic XML parsing for RSS
    const items = []
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

    let count = 0
    for (const match of itemMatches) {
      if (count >= 10) break
      const itemXml = match[1]

      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                         itemXml.match(/<title>(.*?)<\/title>/)
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/)
      const authorMatch = itemXml.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/) ||
                          itemXml.match(/<dc:creator>(.*?)<\/dc:creator>/)
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)

      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1],
          url: linkMatch[1],
          author: authorMatch ? authorMatch[1] : 'TechCrunch',
          date: dateMatch ? dateMatch[1] : null
        })
        count++
      }
    }

    return { status: 'success', items }
  } catch (error) {
    console.log(`  ❌ TechCrunch error: ${error.message}`)
    return { status: 'failed', error: error.message, items: [] }
  }
}

// 니치 앱 판별 함수 (신규로 뜨고 있는 앱 찾기)
function isNicheApp(app, platform = 'android') {
  // 대기업 제외
  const bigPlayers = ['Google', 'Meta', 'Microsoft', 'Apple', 'Amazon', 'Tencent', 'ByteDance',
                      'Facebook', 'Instagram', 'WhatsApp', 'Alibaba', 'Baidu', 'Samsung', 'Netflix',
                      'Spotify', 'Uber', 'Airbnb', 'Twitter', 'Snap Inc', 'Pinterest', 'LinkedIn',
                      'Adobe', 'Oracle', 'Salesforce', 'SAP', 'IBM', 'Cisco', 'Intel', 'NVIDIA',
                      'AT&T', 'Verizon', 'T-Mobile', 'Comcast', 'Disney', 'Warner', 'Sony', 'LG',
                      'Dropbox', 'Zoom', 'Slack', 'Notion', 'Canva', 'Grammarly', 'OpenAI', 'xAI',
                      'Anthropic', 'Yahoo', 'PayPal', 'eBay', 'Booking', 'Expedia', 'TripAdvisor']
  const developerName = app.developer || app.artistName || app.developerId || ''
  if (bigPlayers.some(p => developerName.toLowerCase().includes(p.toLowerCase()))) return false

  // 니치 앱 설정 가져오기
  const settings = config.niche_app_settings || {}
  const minRating = settings.min_rating || 4.0

  // 평점 확인 (정보가 있는 경우만 - App Store list API는 score를 제공하지 않음)
  const score = app.score || app.rating
  if (score !== undefined && score < minRating) return false

  // 리뷰 수 확인 (있는 경우만)
  const reviews = app.reviews || app.ratings
  if (reviews !== undefined) {
    const minReviews = settings.min_reviews || 100
    const maxReviews = settings.max_reviews || 10000
    if (reviews < minReviews || reviews > maxReviews) return false
  }

  return true
}

// 니치 점수 계산 함수
function calculateNicheScore(app) {
  let score = 50 // 기본 점수

  const reviews = app.reviews || app.ratings
  const rating = app.score || app.rating || 0
  const hasIAP = app.offersIAP

  // 리뷰 수 점수 (정보가 있는 경우만)
  if (reviews !== undefined) {
    if (reviews >= 500 && reviews <= 3000) score += 20
    else if (reviews >= 100 && reviews <= 5000) score += 10
  }

  // 평점 점수
  if (rating >= 4.5) score += 20
  else if (rating >= 4.2) score += 10

  // 인앱 결제 점수 (정보가 있는 경우만)
  if (hasIAP === true) score += 10

  // 순위 점수 (50-100위가 최적)
  const rank = app.rank || 100
  if (rank >= 50 && rank <= 100) score += 10
  else if (rank >= 30 && rank <= 150) score += 5

  return Math.min(100, score)
}

// 최신 앱 판별 함수 (설정된 개월 수 이내 출시)
function isRecentApp(releasedDate, thresholdMonths = 12) {
  if (!releasedDate) return false

  const released = new Date(releasedDate)
  if (isNaN(released.getTime())) return false

  const threshold = new Date()
  threshold.setMonth(threshold.getMonth() - thresholdMonths)

  return released >= threshold
}

// 최신 앱 쿼터를 적용한 최종 선정 함수
function selectAppsWithRecentQuota(apps, totalCount = 10, minRecentCount = 5) {
  // 최신 앱과 기존 앱 분류
  const recentApps = apps.filter(a => a.isRecent).sort((a, b) => b.nicheScore - a.nicheScore)
  const olderApps = apps.filter(a => !a.isRecent).sort((a, b) => b.nicheScore - a.nicheScore)

  const selected = []

  // 1. 최신 앱 먼저 선정 (최소 minRecentCount개)
  const recentToSelect = Math.min(recentApps.length, Math.max(minRecentCount, totalCount - olderApps.length))
  selected.push(...recentApps.slice(0, recentToSelect))

  // 2. 나머지 슬롯에 기존 앱 채우기
  const remainingSlots = totalCount - selected.length
  if (remainingSlots > 0 && olderApps.length > 0) {
    selected.push(...olderApps.slice(0, remainingSlots))
  }

  // 3. 최신 앱이 부족하면 추가로 채우기
  if (selected.length < totalCount && recentApps.length > recentToSelect) {
    const moreRecent = recentApps.slice(recentToSelect, recentToSelect + (totalCount - selected.length))
    selected.push(...moreRecent)
  }

  // nicheScore 순으로 최종 정렬
  return selected.slice(0, totalCount).sort((a, b) => b.nicheScore - a.nicheScore)
}

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Play Store 니치 앱 수집
async function collectPlayStoreNiche() {
  if (!gplay) {
    console.log('  ⚠️  google-play-scraper not installed, skipping...')
    return { status: 'skipped', items: [] }
  }

  const settings = config.niche_app_settings || {}
  const categories = settings.categories || ['PRODUCTIVITY', 'HEALTH_AND_FITNESS', 'FINANCE', 'TOOLS', 'LIFESTYLE']
  const countries = settings.countries || ['us']
  const excludeTopRanks = settings.exclude_top_ranks || 30
  const recentThresholdMonths = settings.recent_app_threshold_months || 12
  const minRecentApps = settings.min_recent_apps || 5
  const totalApps = settings.total_apps || 10
  const collections = [gplay.collection.TOP_FREE, gplay.collection.TOP_PAID, gplay.collection.GROSSING]
  const collectionNames = ['TOP_FREE', 'TOP_PAID', 'TOP_GROSSING']

  const items = []
  const seenIds = new Set()

  for (const country of countries) {
    for (let catIdx = 0; catIdx < categories.length; catIdx++) {
      const category = categories[catIdx]

      for (let colIdx = 0; colIdx < collections.length; colIdx++) {
        const collection = collections[colIdx]
        const collectionName = collectionNames[colIdx]

        try {
          // Rate limiting: 1초 딜레이
          await delay(1000)

          const apps = await gplay.list({
            category: gplay.category[category] || category,
            collection: collection,
            country: country,
            num: 150, // 상위 150개 가져와서 필터링
            fullDetail: false
          })

          // 상위 30개 제외하고 니치 앱 필터링
          const filteredApps = apps
            .slice(excludeTopRanks) // 상위 30개 제외
            .map((app, idx) => ({ ...app, rank: excludeTopRanks + idx + 1 }))
            .filter(app => isNicheApp(app, 'android'))
            .slice(0, 15) // 카테고리/차트당 최대 15개 (fullDetail 조회 대상)

          // 니치 앱 후보에 대해 fullDetail 조회하여 출시일 확인
          for (const app of filteredApps) {
            if (seenIds.has(app.appId)) continue

            try {
              await delay(300) // Rate limiting for detail API
              const detail = await gplay.app({ appId: app.appId, country: country })

              seenIds.add(app.appId)

              const releasedDate = detail.released || null
              const recentFlag = isRecentApp(releasedDate, recentThresholdMonths)

              items.push({
                id: app.appId,
                title: app.title,
                developer: app.developer,
                url: app.url,
                score: detail.score || app.score || 0,
                reviews: detail.reviews || app.reviews || 0,
                installs: detail.installs || app.installs || 'N/A',
                offersIAP: detail.offersIAP || app.offersIAP || false,
                iapRange: detail.IAPRange || app.IAPRange || 'N/A',
                category: category,
                collection: collectionName,
                country: country,
                rank: app.rank,
                nicheScore: calculateNicheScore({ ...app, ...detail }),
                platform: 'android',
                icon: detail.icon || app.icon,
                released: releasedDate,
                updated: detail.updated || null,
                isRecent: recentFlag
              })
            } catch (detailError) {
              // Detail 조회 실패 시 기본 정보로 추가 (최신 아님으로 처리)
              seenIds.add(app.appId)
              items.push({
                id: app.appId,
                title: app.title,
                developer: app.developer,
                url: app.url,
                score: app.score || 0,
                reviews: app.reviews || 0,
                installs: app.installs || 'N/A',
                offersIAP: app.offersIAP || false,
                iapRange: app.IAPRange || 'N/A',
                category: category,
                collection: collectionName,
                country: country,
                rank: app.rank,
                nicheScore: calculateNicheScore(app),
                platform: 'android',
                icon: app.icon,
                released: null,
                updated: null,
                isRecent: false
              })
            }
          }
        } catch (e) {
          // 개별 카테고리 오류는 무시하고 계속
          console.log(`    ⚠️  Play Store ${category}/${collectionName}/${country}: ${e.message}`)
        }
      }
    }
  }

  // 최신 앱 쿼터를 적용한 최종 선정 (10개 중 최소 5개 최신)
  const selectedItems = selectAppsWithRecentQuota(items, totalApps, minRecentApps)

  // 통계 로그
  const recentCount = selectedItems.filter(a => a.isRecent).length
  console.log(`    📊 Play Store: ${recentCount}/${selectedItems.length} recent apps (total candidates: ${items.length})`)

  return {
    status: selectedItems.length > 0 ? 'success' : 'partial',
    items: selectedItems
  }
}

// App Store 니치 앱 수집
async function collectAppStoreNiche() {
  if (!appStore) {
    console.log('  ⚠️  app-store-scraper not installed, skipping...')
    return { status: 'skipped', items: [] }
  }

  const settings = config.niche_app_settings || {}
  const categories = settings.categories || ['PRODUCTIVITY', 'HEALTH_AND_FITNESS', 'FINANCE', 'UTILITIES', 'LIFESTYLE']
  const countries = settings.countries || ['us']
  const excludeTopRanks = settings.exclude_top_ranks || 30
  const recentThresholdMonths = settings.recent_app_threshold_months || 12
  const minRecentApps = settings.min_recent_apps || 5
  const totalApps = settings.total_apps || 10

  // App Store 카테고리 매핑
  const categoryMap = {
    'PRODUCTIVITY': appStore.category.PRODUCTIVITY,
    'HEALTH_AND_FITNESS': appStore.category.HEALTH_AND_FITNESS,
    'FINANCE': appStore.category.FINANCE,
    'UTILITIES': appStore.category.UTILITIES,
    'TOOLS': appStore.category.UTILITIES, // iOS에서는 UTILITIES
    'LIFESTYLE': appStore.category.LIFESTYLE
  }

  const collections = [
    { type: appStore.collection.TOP_FREE_IOS, name: 'TOP_FREE' },
    { type: appStore.collection.TOP_PAID_IOS, name: 'TOP_PAID' },
    { type: appStore.collection.TOP_GROSSING_IOS, name: 'TOP_GROSSING' }
  ]

  const items = []
  const seenIds = new Set()

  for (const country of countries) {
    for (const category of categories) {
      const categoryId = categoryMap[category]
      if (!categoryId) continue

      for (const col of collections) {
        try {
          // Rate limiting: 1초 딜레이
          await delay(1000)

          const apps = await appStore.list({
            category: categoryId,
            collection: col.type,
            country: country,
            num: 150
          })

          // 상위 30개 제외하고 니치 앱 필터링
          const filteredApps = apps
            .slice(excludeTopRanks)
            .map((app, idx) => ({ ...app, rank: excludeTopRanks + idx + 1 }))
            .filter(app => isNicheApp(app, 'ios'))
            .slice(0, 15) // 카테고리/차트당 최대 15개 (fullDetail 조회 대상)

          // 니치 앱 후보에 대해 fullDetail 조회하여 출시일 확인
          for (const app of filteredApps) {
            if (seenIds.has(app.id)) continue

            try {
              await delay(300) // Rate limiting for detail API
              const detail = await appStore.app({ id: app.id, country: country })

              seenIds.add(app.id)

              const releasedDate = detail.released || null
              const recentFlag = isRecentApp(releasedDate, recentThresholdMonths)

              items.push({
                id: String(app.id),
                title: detail.title || app.title || app.name,
                developer: detail.developer || app.developer || app.artistName,
                url: detail.url || app.url,
                score: detail.score || app.score || 0,
                reviews: detail.reviews || app.reviews || app.ratings || 0,
                offersIAP: detail.offersIAP || app.offersIAP || false,
                price: detail.price || app.price || 0,
                category: category,
                collection: col.name,
                country: country,
                rank: app.rank,
                nicheScore: calculateNicheScore({ ...app, ...detail }),
                platform: 'ios',
                icon: detail.icon || app.icon,
                released: releasedDate,
                updated: detail.updated || null,
                isRecent: recentFlag
              })
            } catch (detailError) {
              // Detail 조회 실패 시 기본 정보로 추가 (최신 아님으로 처리)
              seenIds.add(app.id)
              items.push({
                id: String(app.id),
                title: app.title || app.name,
                developer: app.developer || app.artistName,
                url: app.url,
                score: app.score || 0,
                reviews: app.reviews || app.ratings || 0,
                offersIAP: app.offersIAP || false,
                price: app.price || 0,
                category: category,
                collection: col.name,
                country: country,
                rank: app.rank,
                nicheScore: calculateNicheScore(app),
                platform: 'ios',
                icon: app.icon,
                released: null,
                updated: null,
                isRecent: false
              })
            }
          }
        } catch (e) {
          console.log(`    ⚠️  App Store ${category}/${col.name}/${country}: ${e.message}`)
        }
      }
    }
  }

  // 최신 앱 쿼터를 적용한 최종 선정 (10개 중 최소 5개 최신)
  const selectedItems = selectAppsWithRecentQuota(items, totalApps, minRecentApps)

  // 통계 로그
  const recentCount = selectedItems.filter(a => a.isRecent).length
  console.log(`    📊 App Store: ${recentCount}/${selectedItems.length} recent apps (total candidates: ${items.length})`)

  return {
    status: selectedItems.length > 0 ? 'success' : 'partial',
    items: selectedItems
  }
}

// 키 트렌드 추출
function extractKeyTrends(data) {
  const keywords = {}

  // Product Hunt topics
  data.product_hunt?.items?.forEach(item => {
    item.topics?.forEach(topic => {
      keywords[topic] = (keywords[topic] || 0) + 2
    })
    // Extract from tagline
    const words = (item.tagline || '').toLowerCase().split(/\s+/)
    words.forEach(w => {
      if (w.length > 3 && !['with', 'your', 'the', 'and', 'for'].includes(w)) {
        keywords[w] = (keywords[w] || 0) + 1
      }
    })
  })

  // GitHub languages and keywords
  data.github_trending?.items?.forEach(item => {
    if (item.language) keywords[item.language] = (keywords[item.language] || 0) + 1
    const words = (item.description || '').toLowerCase().split(/\s+/)
    words.forEach(w => {
      if (w.length > 4 && ['ai', 'agent', 'llm', 'api', 'tool', 'dev'].some(k => w.includes(k))) {
        keywords[w] = (keywords[w] || 0) + 1
      }
    })
  })

  // Sort and return top trends
  const sorted = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([k]) => k)

  return sorted
}

// 메인 수집 함수
async function collectAll() {
  console.log(`\n📊 PRD-Agent Data Collection - ${today}\n`)
  console.log('=' .repeat(60))

  const results = {
    date: today,
    collected_at: new Date().toISOString(),
    total_items: 0,
    sources: {}
  }

  // 병렬 수집
  const collectors = [
    { name: 'product_hunt', label: 'Product Hunt', fn: collectProductHunt },
    { name: 'hacker_news', label: 'Hacker News', fn: collectHackerNews },
    { name: 'github_trending', label: 'GitHub Trending', fn: collectGitHubTrending },
    { name: 'youtube_trending', label: 'YouTube Trending', fn: collectYouTubeTrending },
    { name: 'geeknews', label: 'GeekNews', fn: collectGeekNews },
    { name: 'dev_to', label: 'Dev.to', fn: collectDevTo },
    { name: 'lobsters', label: 'Lobsters', fn: collectLobsters },
    { name: 'indie_hackers', label: 'Indie Hackers', fn: collectIndieHackers },
    { name: 'techcrunch', label: 'TechCrunch', fn: collectTechCrunch },
    { name: 'google_trends', label: 'Google Trends', fn: collectGoogleTrends },
    { name: 'naver_trends', label: 'Naver Trends', fn: collectNaverTrends },
    { name: 'playstore_niche', label: 'Play Store Niche', fn: collectPlayStoreNiche },
    { name: 'appstore_niche', label: 'App Store Niche', fn: collectAppStoreNiche }
  ]

  for (const collector of collectors) {
    process.stdout.write(`📥 ${collector.label}... `)
    try {
      const result = await collector.fn()
      results.sources[collector.name] = {
        name: collector.label,
        status: result.status,
        items_count: result.items?.length || 0,
        items: result.items || []
      }
      results.total_items += result.items?.length || 0
      console.log(`✅ ${result.items?.length || 0} items`)
    } catch (error) {
      results.sources[collector.name] = {
        name: collector.label,
        status: 'failed',
        error: error.message,
        items_count: 0,
        items: []
      }
      console.log(`❌ Failed: ${error.message}`)
    }
  }

  // 키 트렌드 추출
  results.key_trends = extractKeyTrends(results.sources)

  console.log('\n' + '='.repeat(60))
  console.log(`📊 Total items collected: ${results.total_items}`)
  console.log(`🔥 Key trends: ${results.key_trends.slice(0, 5).join(', ')}`)

  // 파일 저장
  const outputDir = path.join(process.cwd(), config.output.sources_dir)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, `${today}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\n💾 Saved to: ${outputPath}`)

  return results
}

// 실행
collectAll()
  .then(() => {
    console.log('\n✅ Collection complete!\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Collection failed:', error)
    process.exit(1)
  })
