const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

// 복사할 디렉토리 매핑
const mappings = [
  { source: 'generated/insights', dest: 'content/insights', type: 'insight' },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 첫 번째 h1 제목 추출
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].replace(/[*_`]/g, '').trim() : null
}

// 첫 번째 문단 또는 요약 추출
function extractDescription(content, type) {
  // "한 줄 요약" 패턴 찾기
  const summaryMatch = content.match(/\*\*한 줄 요약[:\*]*\s*(.+)/i)
  if (summaryMatch) {
    return summaryMatch[1].replace(/\*\*/g, '').trim().slice(0, 160)
  }

  // 첫 번째 일반 문단 찾기 (제목, 빈 줄, 메타데이터 제외)
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (
      trimmed &&
      !trimmed.startsWith('#') &&
      !trimmed.startsWith('---') &&
      !trimmed.startsWith('**Date') &&
      !trimmed.startsWith('**Persona') &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('*')
    ) {
      return trimmed.slice(0, 160)
    }
  }

  // 기본 설명
  const defaults = {
    insight: 'MVP 아이디어 인사이트 분석',
  }
  return defaults[type] || '블로그 콘텐츠'
}

// 키워드 추출
function extractKeywords(content, type, filename) {
  const keywords = []

  // 타입별 기본 키워드
  if (type === 'insight') {
    keywords.push('MVP', '인사이트', '트렌드', '아이디어')
    if (filename.includes('profit')) keywords.push('수익화', 'Profit')
    if (filename.includes('essence')) keywords.push('본질', 'Essence')
  }

  return keywords.join(', ')
}

// 카테고리 추출 (콘텐츠 기반)
function extractCategories(content) {
  const categories = new Set()

  // 키워드 기반 카테고리 매핑
  const categoryPatterns = {
    'AI Tools': ['ai', 'llm', 'gpt', 'claude', 'machine learning', '인공지능', 'agent'],
    'Developer Experience': ['developer', 'devtools', 'ide', 'code', 'programming', '개발자'],
    'SaaS': ['saas', 'subscription', 'mrr', 'arr', 'b2b'],
    'Productivity': ['productivity', 'automation', 'workflow', '생산성', '자동화'],
    'Startup': ['startup', 'indie', 'founder', 'launch', '스타트업', '창업'],
    'Open Source': ['open-source', 'github', 'oss', '오픈소스'],
    'Mobile': ['mobile', 'ios', 'android', 'app', '앱'],
    'Web': ['web', 'frontend', 'backend', 'fullstack', '웹'],
    'Design': ['design', 'ui', 'ux', 'figma', '디자인'],
    'Marketing': ['marketing', 'seo', 'growth', '마케팅']
  }

  const lowerContent = content.toLowerCase()

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      if (lowerContent.includes(pattern)) {
        categories.add(category)
        break
      }
    }
  }

  // 기본 카테고리
  if (categories.size === 0) {
    categories.add('Tech Trends')
  }

  return Array.from(categories).slice(0, 3)
}

// 태그 추출 (콘텐츠 기반)
function extractTags(content) {
  const tags = new Set()

  // Product Hunt 제품명 추출
  const productMatches = content.matchAll(/###\s*\d*\.?\s*([^\n⬆️]+)/g)
  for (const match of productMatches) {
    const name = match[1].trim().toLowerCase().replace(/[^a-z0-9가-힣\s]/g, '').split(/\s+/).slice(0, 2).join('-')
    if (name.length > 2) tags.add(name)
  }

  // 기술 키워드 추출
  const techKeywords = ['react', 'vue', 'node', 'python', 'rust', 'go', 'typescript', 'javascript', 'swift', 'kotlin', 'ai', 'ml', 'llm', 'api', 'saas', 'b2b', 'b2c', 'mvp', 'open-source', 'claude', 'gpt', 'openai', 'anthropic']

  const lowerContent = content.toLowerCase()
  for (const keyword of techKeywords) {
    if (lowerContent.includes(keyword)) {
      tags.add(keyword)
    }
  }

  return Array.from(tags).slice(0, 10)
}

// frontmatter가 있는지 확인
function hasFrontmatter(content) {
  return content.trimStart().startsWith('---')
}

// YAML 안전하게 이스케이프
function escapeYaml(str) {
  if (!str) return ''
  // 따옴표와 특수문자 이스케이프
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .trim()
}

// frontmatter 추가
function addFrontmatter(content, filename, type) {
  if (hasFrontmatter(content)) {
    return content // 이미 있으면 그대로 반환
  }

  const rawTitle = extractTitle(content) || filename.replace(/\.(md|mdx)$/, '')
  const rawDescription = extractDescription(content, type)
  const rawKeywords = extractKeywords(content, type, filename)
  const categories = extractCategories(content)
  const tags = extractTags(content)

  const title = escapeYaml(rawTitle)
  const description = escapeYaml(rawDescription)
  const keywords = escapeYaml(rawKeywords)

  // 날짜 추출 (파일명에서)
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  // 카테고리와 태그를 YAML 배열 형식으로
  const categoriesYaml = categories.map(c => `  - "${c}"`).join('\n')
  const tagsYaml = tags.map(t => `  - "${t}"`).join('\n')

  const frontmatter = `---
title: "${title}"
description: "${description}"
keywords: "${keywords}"
date: "${date}"
categories:
${categoriesYaml}
tags:
${tagsYaml}
---

`

  return frontmatter + content
}

function copyMdFiles(sourceDir, destDir, type) {
  ensureDir(destDir)

  const files = fs.readdirSync(sourceDir)

  files.forEach(file => {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const sourcePath = path.join(sourceDir, file)
      // .md 파일을 .mdx로 변환 (커스텀 컴포넌트 사용을 위해)
      const destFile = file.replace(/\.md$/, '.mdx')
      const destPath = path.join(destDir, destFile)

      // 파일 읽기
      let content = fs.readFileSync(sourcePath, 'utf8')

      // frontmatter 추가
      content = addFrontmatter(content, file, type)

      // 파일 쓰기
      fs.writeFileSync(destPath, content)
      console.log(`Copied with SEO: ${file} -> ${destFile}`)
    }
  })
}

console.log('Syncing content with SEO metadata...\n')

mappings.forEach(({ source, dest, type }) => {
  const sourceDir = path.join(rootDir, source)
  const destDir = path.join(rootDir, dest)

  if (fs.existsSync(sourceDir)) {
    console.log(`[${source}] -> [${dest}]`)
    copyMdFiles(sourceDir, destDir, type)
    console.log('')
  } else {
    console.log(`Skipping ${source}: directory not found`)
  }
})

console.log('Content sync complete!')
