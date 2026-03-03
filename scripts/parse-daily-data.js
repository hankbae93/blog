const fs = require('fs');
const path = require('path');

const date = process.argv[2] || '2026-03-03';
const sourcePath = path.join(__dirname, '../generated/sources', `${date}.json`);
const data = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

// Extract data
const output = {
  producthunt: data.sources.product_hunt?.items?.slice(0, 10) || [],
  hackernews: data.sources.hacker_news?.items?.slice(0, 15) || [],
  github: data.sources.github_trending?.items?.slice(0, 10) || [],
  youtube: (data.sources.youtube_trending?.items || []).filter(v => {
    const t = (v.title || '').toLowerCase();
    return t.includes('programming') || t.includes('coding') ||
           t.includes('developer') || t.includes('tech') ||
           t.includes('ai') || t.includes('software') ||
           t.includes('code') || t.includes('tutorial') ||
           t.includes('python') || t.includes('javascript');
  }).slice(0, 15),
  lobsters: data.sources.lobsters?.items?.slice(0, 10) || [],
  google_trends: (data.sources.google_trends?.items || []).filter(t => t.tech_relevant),
  korean_tech: data.sources.korean_tech_trends?.items || {},
  playstore_niche: data.sources.playstore_niche?.items || [],
  appstore_niche: data.sources.appstore_niche?.items || [],
  key_trends: data.key_trends || []
};

console.log(JSON.stringify(output, null, 2));
