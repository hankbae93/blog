const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()
const siteUrl = 'https://blog-three-lac-61.vercel.app'
const siteName = 'Hank Dev Log'

// 복사할 디렉토리 매핑
const mappings = [
  { source: 'generated/insights', dest: 'content/insights', type: 'insight' },
  { source: 'generated/summaries/weekly', dest: 'content/summaries/weekly', type: 'weekly' },
  { source: 'generated/summaries/monthly', dest: 'content/summaries/monthly', type: 'monthly' },
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

// 타이틀 생성 (타입별)
function generateTitle(filename, type) {
  if (type === 'weekly') {
    const weekMatch = filename.match(/(\d{4}-W\d{2})/)
    return weekMatch ? `Weekly Summary | ${weekMatch[1]}` : `Weekly Summary`
  }
  if (type === 'monthly') {
    const monthMatch = filename.match(/(\d{4}-\d{2})/)
    return monthMatch ? `Monthly Report | ${monthMatch[1]}` : `Monthly Report`
  }
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  return dateMatch ? `Insight | ${dateMatch[1]}` : `Insight`
}

// SEO용 frontmatter 생성
function generateSeoFrontmatter(originalFm, filename, body, type) {
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  const weekMatch = filename.match(/(\d{4})-W(\d{2})/)
  const date = dateMatch ? dateMatch[1] : weekMatch ? `${weekMatch[1]}-01-01` : originalFm.date || new Date().toISOString().split('T')[0]

  const title = generateTitle(filename, type)
  const description = originalFm.description || '1인 개발자를 위한 데일리 트렌드 인사이트'
  const keywords = Array.isArray(originalFm.keywords)
    ? originalFm.keywords
    : (originalFm.keywords ? [originalFm.keywords] : ['트렌드', '인사이트', '1인개발자'])

  const slug = filename.replace(/\.(md|mdx)$/, '')
  const urlPrefix = type === 'weekly' ? 'summaries/weekly' : type === 'monthly' ? 'summaries/monthly' : 'insights'
  const canonicalUrl = `${siteUrl}/${urlPrefix}/${slug}`
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
      const seoFrontmatter = generateSeoFrontmatter(frontmatter, file, body, type)

      // MDX에서 중괄호를 JSX 표현식으로 해석하지 않도록 이스케이프
      // 코드 블록(```) 밖의 {{ }} 패턴을 {`{{ }}`}로 변환
      const escapedBody = body.replace(/(?<!`)(\{\{[^}`]+\}\})(?!`)/g, '{`$1`}')

      // 최종 콘텐츠
      const finalContent = seoFrontmatter + escapedBody

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
