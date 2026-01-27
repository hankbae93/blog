const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

// _meta.ts를 생성할 디렉토리들
const directories = [
  'content',
  'content/insights',
  'content/prd',
  'content/persona',
]

function extractTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    // 첫 번째 h1 제목 추출
    const match = content.match(/^#\s+(.+)$/m)
    if (match) {
      return match[1].replace(/[*_`]/g, '').trim()
    }
  } catch (e) {
    // 파일 읽기 실패 시 무시
  }
  return null
}

function generateMeta(dir) {
  const dirPath = path.join(rootDir, dir)

  if (!fs.existsSync(dirPath)) {
    console.log(`Skipping ${dir}: directory not found`)
    return
  }

  const files = fs.readdirSync(dirPath)
    .filter(f => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('_'))
    .sort((a, b) => b.localeCompare(a)) // 최신 순 정렬

  // content 루트는 특별 처리
  if (dir === 'content') {
    const meta = `export default {
  index: {
    title: '홈',
    type: 'page',
    display: 'hidden'
  },
  insights: 'Insights',
  prd: 'PRD 문서',
  persona: 'Persona'
}
`
    const metaPath = path.join(dirPath, '_meta.ts')
    fs.writeFileSync(metaPath, meta)
    console.log(`Generated: ${dir}/_meta.ts (root navigation)`)
    return
  }

  const entries = files
    .filter(file => !file.startsWith('index.')) // index 파일은 별도 처리
    .map(file => {
      const slug = file.replace(/\.(md|mdx)$/, '')
      const filePath = path.join(dirPath, file)
      const title = extractTitle(filePath) || slug
      // 제목에서 특수 문자 이스케이프
      const escapedTitle = title.replace(/'/g, "\\'")
      return `  '${slug}': '${escapedTitle}'`
    })

  // index 항목을 맨 앞에 추가
  const meta = `export default {
  index: '개요',
${entries.join(',\n')}
}
`

  const metaPath = path.join(dirPath, '_meta.ts')
  fs.writeFileSync(metaPath, meta)
  console.log(`Generated: ${dir}/_meta.ts (${files.length} entries)`)
}

console.log('Generating _meta.ts files...\n')

directories.forEach(dir => {
  generateMeta(dir)
})

console.log('\nMeta generation complete!')
