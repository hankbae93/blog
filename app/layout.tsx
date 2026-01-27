import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import '../styles/globals.css'

export const metadata = {
  title: {
    default: 'Blog',
    template: '%s - Blog',
  },
  description: '트렌드 데이터 기반 MVP 아이디어 도출 및 PRD 생성',
  openGraph: {
    type: 'article',
    siteName: 'Blog',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: 'index, follow',
}

const logo = (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img
      src="/assets/logo_circle.png"
      alt="Logo"
      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
    />
    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Blog</span>
  </div>
)

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
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6199862544071798"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Layout
          pageMap={pageMap}
          navbar={<Navbar logo={logo} />}
          footer={<Footer>Built with Claude Code</Footer>}
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
