const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

// 복사할 디렉토리 매핑
const mappings = [
  { source: 'insights', dest: 'content/insights', type: 'insight' },
  { source: 'output', dest: 'content/prd', type: 'prd' },
  { source: 'my-persona', dest: 'content/persona', type: 'persona' },
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
    prd: 'Product Requirements Document',
    persona: '페르소나 설정',
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
  } else if (type === 'prd') {
    keywords.push('PRD', '기획서', '요구사항', 'MVP')
    // PRD 제목에서 제품명 추출
    const title = extractTitle(content)
    if (title) {
      const productName = title.replace(/^PRD:\s*/i, '').trim()
      if (productName) keywords.push(productName)
    }
  } else if (type === 'persona') {
    keywords.push('페르소나', '사용자', '프로덕트')
  }

  return keywords.join(', ')
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

  const title = escapeYaml(rawTitle)
  const description = escapeYaml(rawDescription)
  const keywords = escapeYaml(rawKeywords)

  // 날짜 추출 (파일명에서)
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  const frontmatter = `---
title: "${title}"
description: "${description}"
keywords: "${keywords}"
date: "${date}"
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
      const destPath = path.join(destDir, file)

      // 파일 읽기
      let content = fs.readFileSync(sourcePath, 'utf8')

      // frontmatter 추가
      content = addFrontmatter(content, file, type)

      // 파일 쓰기
      fs.writeFileSync(destPath, content)
      console.log(`Copied with SEO: ${file}`)
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
