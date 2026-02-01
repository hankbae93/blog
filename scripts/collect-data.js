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

// GitHub Trending (scrape via API alternative)
async function collectGitHubTrending() {
  try {
    // GitHub doesn't have official trending API, use ghapi.huchen.dev
    const res = await fetch('https://api.gitterapp.com/repositories?since=daily')
    const repos = JSON.parse(res.data).slice(0, 10)

    const items = repos.map(repo => ({
      name: `${repo.author}/${repo.name}`,
      description: repo.description || '',
      language: repo.language || 'Unknown',
      stars_today: repo.currentPeriodStars || 0,
      total_stars: repo.stars || 0,
      url: repo.url || `https://github.com/${repo.author}/${repo.name}`
    }))

    return { status: 'success', items }
  } catch (error) {
    // Fallback: try alternative API
    try {
      const res = await fetch('https://api.github.com/search/repositories?q=created:>' +
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
        '&sort=stars&order=desc&per_page=10')
      const data = JSON.parse(res.data)
      const items = data.items?.map(repo => ({
        name: repo.full_name,
        description: repo.description || '',
        language: repo.language || 'Unknown',
        stars_today: 0,
        total_stars: repo.stargazers_count,
        url: repo.html_url
      })) || []
      return { status: 'success', items }
    } catch (e) {
      console.log(`  ❌ GitHub Trending error: ${error.message}`)
      return { status: 'failed', error: error.message, items: [] }
    }
  }
}

// YouTube Trending (API)
async function collectYouTubeTrending() {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.log('  ⚠️  YOUTUBE_API_KEY not set, skipping...')
    return { status: 'skipped', items: [] }
  }

  const categories = [
    { id: 28, name: 'Science & Tech' },
    { id: 27, name: 'Education' }
  ]
  const regions = ['KR', 'US']

  const allItems = []

  for (const category of categories) {
    for (const region of regions) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${region}&maxResults=5&videoCategoryId=${category.id}&key=${apiKey}`
        const res = await fetch(url)
        const data = JSON.parse(res.data)

        const items = data.items?.map(video => ({
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          views: parseInt(video.statistics?.viewCount || 0),
          likes: parseInt(video.statistics?.likeCount || 0),
          publishedAt: video.snippet.publishedAt,
          category: category.name,
          region: region,
          tags: video.snippet.tags?.slice(0, 5) || []
        })) || []

        allItems.push(...items)
      } catch (e) {
        console.log(`  ⚠️  YouTube ${category.name} (${region}): ${e.message}`)
      }
    }
  }

  return {
    status: allItems.length > 0 ? 'success' : 'failed',
    items: allItems
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
    { name: 'techcrunch', label: 'TechCrunch', fn: collectTechCrunch }
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
