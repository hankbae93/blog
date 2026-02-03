import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import '../styles/globals.css'

const siteUrl = 'https://blog-three-lac-61.vercel.app'
const siteName = 'Hank Dev Log'
const siteDescription = '1인 개발자 Hank의 트렌드 인사이트, 개발기, 회고를 담은 기술 블로그. MVP 아이디어, Product Hunt 트렌드, 프론트엔드/백엔드 개발 경험을 공유합니다.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ['개발자 블로그', '프론트엔드', '백엔드', 'MVP', '사이드프로젝트', '1인개발', 'Product Hunt', '트렌드', '인사이트', '개발 회고'],
  authors: [{ name: 'Hank', url: siteUrl }],
  creator: 'Hank',
  publisher: 'Hank',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: siteName,
    locale: 'ko_KR',
    url: siteUrl,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/assets/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/assets/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
}

const logo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img
      src="/assets/logo_circle.png"
      alt="Hank Dev Log"
      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
    />
    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Hank Dev Log</span>
  </div>
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  author: {
    '@type': 'Person',
    name: 'Hank',
  },
  publisher: {
    '@type': 'Person',
    name: 'Hank',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()

  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6199862544071798"
          crossOrigin="anonymous"
        />
        <link rel="canonical" href={siteUrl} />
      </Head>
      <body>
        <Layout
          pageMap={pageMap}
          navbar={<Navbar logo={logo} />}
          sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
          toc={{ float: true }}
          darkMode
          editLink={null}
          feedback={{ content: null }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
