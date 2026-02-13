/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://blog-three-lac-61.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/404', '/_not-found'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Yeti',
        allow: '/',
      },
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // 인사이트 페이지: URL에서 날짜를 추출하여 실제 발행일을 lastmod로 사용
    const insightMatch = path.match(/\/insights\/(\d{4}-\d{2}-\d{2})$/)
    if (insightMatch) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date(insightMatch[1] + 'T09:00:00+09:00').toISOString(),
      }
    }
    if (path.includes('/insights')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }
    // 개발기 페이지
    if (path.includes('/dev-log/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    // 회고 페이지: URL에서 연도를 추출
    const retroMatch = path.match(/\/retrospective\/(\d{4})$/)
    if (retroMatch) {
      return {
        loc: path,
        changefreq: 'yearly',
        priority: 0.7,
        lastmod: new Date(retroMatch[1] + '-12-31T00:00:00+09:00').toISOString(),
      }
    }
    // 기본 설정
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
