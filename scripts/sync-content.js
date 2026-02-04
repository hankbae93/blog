const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()
const siteUrl = 'https://blog-three-lac-61.vercel.app'
const siteName = 'Hank Dev Log'

// 복사할 디렉토리 매핑
const mappings = [
  { source: 'generated/insights', dest: 'content/insights', type: 'insight' },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// frontmatter 파싱
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatterStr = match[1]
  const body = match[2]

  // 간단한 YAML 파싱
  const frontmatter = {}
  const lines = frontmatterStr.split('\n')
  let currentKey = null
  let currentArray = null

  for (const line of lines) {
    // 배열 항목
    if (line.match(/^\s+-\s+/)) {
      if (currentArray) {
        const value = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim()
        currentArray.push(value)
      }
      continue
    }

    // 키-값 쌍
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      currentKey = kvMatch[1]
      let value = kvMatch[2].trim()

      // 빈 값이면 배열 시작
      if (!value) {
        currentArray = []
        frontmatter[currentKey] = currentArray
      } else {
        // JSON 배열 형태 체크 (예: ["a", "b"])
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            frontmatter[currentKey] = JSON.parse(value)
          } catch {
            frontmatter[currentKey] = value.replace(/^["']|["']$/g, '')
          }
        } else {
          // 따옴표 제거
          value = value.replace(/^["']|["']$/g, '')
          frontmatter[currentKey] = value
        }
        currentArray = null
      }
    }
  }

  return { frontmatter, body }
}

// 날짜에서 타이틀 생성
function generateTitle(date) {
  return `Insight | ${date}`
}

// SEO용 frontmatter 생성
function generateSeoFrontmatter(originalFm, filename, body) {
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : originalFm.date || new Date().toISOString().split('T')[0]

  const title = generateTitle(date)
  const description = originalFm.description || '1인 개발자를 위한 데일리 트렌드 인사이트'
  const keywords = Array.isArray(originalFm.keywords)
    ? originalFm.keywords
    : (originalFm.keywords ? [originalFm.keywords] : ['트렌드', '인사이트', '1인개발자'])

  const slug = filename.replace(/\.(md|mdx)$/, '')
  const canonicalUrl = `${siteUrl}/insights/${slug}`
  const ogImage = `${siteUrl}/assets/og-image.png`

  // YAML 이스케이프
  const escapeYaml = (str) => str.replace(/"/g, '\\"').replace(/\n/g, ' ').trim()

  return `---
title: "${escapeYaml(title)}"
date: "${date}"
description: "${escapeYaml(description)}"
keywords:
${keywords.map(k => `  - "${escapeYaml(k)}"`).join('\n')}
openGraph:
  type: "article"
  title: "${escapeYaml(title)}"
  description: "${escapeYaml(description)}"
  url: "${canonicalUrl}"
  siteName: "${siteName}"
  locale: "ko_KR"
  images:
    - url: "${ogImage}"
      width: 1200
      height: 630
      alt: "${escapeYaml(title)}"
twitter:
  card: "summary_large_image"
  title: "${escapeYaml(title)}"
  description: "${escapeYaml(description)}"
  images:
    - "${ogImage}"
canonical: "${canonicalUrl}"
---

`
}

function copyMdFiles(sourceDir, destDir, type) {
  ensureDir(destDir)

  const files = fs.readdirSync(sourceDir)

  files.forEach(file => {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const sourcePath = path.join(sourceDir, file)
      const destFile = file.replace(/\.md$/, '.mdx')
      const destPath = path.join(destDir, destFile)

      // 파일 읽기
      const content = fs.readFileSync(sourcePath, 'utf8')

      // frontmatter 파싱
      const { frontmatter, body } = parseFrontmatter(content)

      // SEO frontmatter 생성
      const seoFrontmatter = generateSeoFrontmatter(frontmatter, file, body)

      // 최종 콘텐츠
      const finalContent = seoFrontmatter + body

      // 파일 쓰기
      fs.writeFileSync(destPath, finalContent)
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
