const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

// _meta.ts를 생성할 디렉토리들
const directories = [
  'content',
  'content/insights',
  'content/summaries/weekly',
  'content/summaries/monthly',
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

  const files = fs
    .readdirSync(dirPath)
    .filter(
      (f) => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('_'),
    )
    .sort((a, b) => b.localeCompare(a)) // 최신 순 정렬

  // content/summaries 중간 디렉토리 생성
  if (dir === 'content/summaries/weekly' || dir === 'content/summaries/monthly') {
    const summariesDir = path.join(rootDir, 'content/summaries')
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true })
    }
    const summariesMetaPath = path.join(summariesDir, '_meta.ts')
    if (!fs.existsSync(summariesMetaPath)) {
      const summariesMeta = `export default {
  weekly: {
    title: 'Weekly',
  },
  monthly: {
    title: 'Monthly',
  },
}
`
      fs.writeFileSync(summariesMetaPath, summariesMeta)
      console.log(`Generated: content/summaries/_meta.ts (navigation)`)
    }
  }

  // content 루트는 특별 처리
  if (dir === 'content') {
    const meta = `export default {
  index: {
    display: 'hidden',
  },
  insights: {
    title: 'Insights',
    type: 'page',
  },
  summaries: {
    title: 'Summaries',
    type: 'page',
  },
  'dev-log': {
    title: '1인개발기',
    type: 'page',
  },
  retrospective: {
    title: '회고',
    type: 'page',
  },
}
`
    const metaPath = path.join(dirPath, '_meta.ts')
    fs.writeFileSync(metaPath, meta)
    console.log(`Generated: ${dir}/_meta.ts (root navigation)`)
    return
  }

  const entries = files
    .filter((file) => !file.startsWith('index.')) // index 파일은 별도 처리
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '')
      const filePath = path.join(dirPath, file)
      const title = extractTitle(filePath) || slug
      // 제목에서 특수 문자 이스케이프
      const escapedTitle = title.replace(/'/g, "\\'")
      return `  '${slug}': '${escapedTitle}'`
    })

  // index 라벨 결정
  const indexLabel = dir.includes('weekly') ? '주간 요약' : dir.includes('monthly') ? '월간 리포트' : '개요'

  // index 항목을 맨 앞에 추가
  const meta = `export default {
  index: '${indexLabel}',
${entries.join(',\n')}
}
`

  const metaPath = path.join(dirPath, '_meta.ts')
  fs.writeFileSync(metaPath, meta)
  console.log(`Generated: ${dir}/_meta.ts (${files.length} entries)`)
}

console.log('Generating _meta.ts files...\n')

directories.forEach((dir) => {
  generateMeta(dir)
})

console.log('\nMeta generation complete!')
