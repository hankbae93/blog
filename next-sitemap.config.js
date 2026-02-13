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
    ],
    additionalSitemaps: [],
  },
  transform: async (config, path) => {
    // 인사이트 페이지는 높은 우선순위
    if (path.includes('/insights/')) {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 0.9,
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
    // 회고 페이지
    if (path.includes('/retrospective/')) {
      return {
        loc: path,
        changefreq: 'yearly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
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
