import React from 'react'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Blog</span>,
  footer: {
    content: 'Built with Claude Code',
  },
  head: function Head() {
    const { asPath } = useRouter()
    const { frontMatter, title } = useConfig()

    const siteTitle = 'Blog'
    const pageTitle = title ? `${title} - ${siteTitle}` : siteTitle
    const description = frontMatter.description || '트렌드 데이터 기반 MVP 아이디어 도출 및 PRD 생성'
    const url = `https://blog.hankbae93.com${asPath}`

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={description} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:locale" content="ko_KR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={url} />

        {/* Keywords from frontmatter */}
        {frontMatter.keywords && (
          <meta name="keywords" content={frontMatter.keywords} />
        )}

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6199862544071798"
          crossOrigin="anonymous"
        />
      </>
    )
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    float: true,
  },
  navigation: {
    prev: true,
    next: true,
  },
  darkMode: true,
  color: {
    hue: 212,
  },
  search: {
    placeholder: '검색...',
  },
  editLink: {
    component: null,
  },
  feedback: {
    content: null,
  },
}

export default config
