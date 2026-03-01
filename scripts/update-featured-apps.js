#!/usr/bin/env node

/**
 * Update featured-apps.json after daily analysis.
 * Reads today's insight file and records which apps were featured.
 * Run after /analyze: node scripts/update-featured-apps.js
 */

const fs = require('fs')
const path = require('path')

const today = new Date().toISOString().split('T')[0]
const insightPath = path.join(process.cwd(), `generated/insights/${today}.md`)
const featuredPath = path.join(process.cwd(), 'generated/app-trends/featured-apps.json')

const playStorePattern = /play\.google\.com\/store\/apps\/details\?id=([a-zA-Z0-9_.]+)/g
const appStorePattern = /apps\.apple\.com\/[^/]+\/app\/[^/]+\/id(\d+)/g

function main() {
  // Read today's insight
  if (!fs.existsSync(insightPath)) {
    console.log(`No insight file for today: ${insightPath}`)
    process.exit(0)
  }

  const content = fs.readFileSync(insightPath, 'utf8')

  // Extract app IDs
  const appIds = new Set()
  for (const match of content.matchAll(playStorePattern)) {
    appIds.add(match[1])
  }
  for (const match of content.matchAll(appStorePattern)) {
    appIds.add(match[1])
  }

  if (appIds.size === 0) {
    console.log('No app IDs found in today\'s insight')
    process.exit(0)
  }

  // Load existing featured-apps.json
  let data = { last_updated: '', total_apps: 0, featured: {} }
  if (fs.existsSync(featuredPath)) {
    data = JSON.parse(fs.readFileSync(featuredPath, 'utf8'))
  }

  // Update
  let newCount = 0
  let updateCount = 0

  for (const appId of appIds) {
    if (!data.featured[appId]) {
      data.featured[appId] = {
        id: appId,
        first_featured: today,
        last_featured: today,
        feature_count: 1,
        last_featured_dates: [today]
      }
      newCount++
    } else {
      const app = data.featured[appId]
      // Skip if already recorded for today
      if (app.last_featured === today) continue

      app.last_featured = today
      app.feature_count++
      app.last_featured_dates.push(today)
      if (app.last_featured_dates.length > 30) {
        app.last_featured_dates = app.last_featured_dates.slice(-30)
      }
      updateCount++
    }
  }

  data.last_updated = new Date().toISOString()
  data.total_apps = Object.keys(data.featured).length

  fs.writeFileSync(featuredPath, JSON.stringify(data, null, 2))
  console.log(`Featured apps updated: ${newCount} new, ${updateCount} updated (total: ${data.total_apps})`)
}

main()
