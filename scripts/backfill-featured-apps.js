#!/usr/bin/env node

/**
 * Backfill featured-apps.json from existing insight files.
 * Run once: node scripts/backfill-featured-apps.js
 */

const fs = require('fs')
const path = require('path')

const insightsDir = path.join(process.cwd(), 'content/insights')
const outputPath = path.join(process.cwd(), 'generated/app-trends/featured-apps.json')

// URL patterns to extract app IDs
const playStorePattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g
const appStorePattern = /apps\.apple\.com\/[^/]+\/app\/[^/]+\/id(\d+)/g

function extractAppIds(content) {
  const ids = new Set()

  for (const match of content.matchAll(playStorePattern)) {
    ids.add(match[1])
  }
  for (const match of content.matchAll(appStorePattern)) {
    ids.add(match[1])
  }

  return [...ids]
}

function extractDate(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

function main() {
  const featured = {}

  if (!fs.existsSync(insightsDir)) {
    console.log('No insights directory found')
    process.exit(1)
  }

  const files = fs.readdirSync(insightsDir)
    .filter(f => f.endsWith('.mdx') || f.endsWith('.md'))
    .sort()

  console.log(`Scanning ${files.length} insight files...`)

  for (const file of files) {
    const date = extractDate(file)
    if (!date) continue

    const content = fs.readFileSync(path.join(insightsDir, file), 'utf8')
    const appIds = extractAppIds(content)

    for (const appId of appIds) {
      if (!featured[appId]) {
        featured[appId] = {
          id: appId,
          first_featured: date,
          last_featured: date,
          feature_count: 1,
          last_featured_dates: [date]
        }
      } else {
        featured[appId].last_featured = date
        featured[appId].feature_count++
        featured[appId].last_featured_dates.push(date)
        // Keep last 30 dates
        if (featured[appId].last_featured_dates.length > 30) {
          featured[appId].last_featured_dates = featured[appId].last_featured_dates.slice(-30)
        }
      }
    }
  }

  const result = {
    last_updated: new Date().toISOString(),
    total_apps: Object.keys(featured).length,
    featured
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
  console.log(`\nDone! ${Object.keys(featured).length} apps tracked`)
  console.log(`Saved to: ${outputPath}`)

  // Show top repeat offenders
  const sorted = Object.values(featured)
    .sort((a, b) => b.feature_count - a.feature_count)
    .slice(0, 10)

  if (sorted.length > 0) {
    console.log('\nTop repeated apps:')
    for (const app of sorted) {
      console.log(`  ${app.id}: ${app.feature_count} times (${app.first_featured} ~ ${app.last_featured})`)
    }
  }
}

main()
