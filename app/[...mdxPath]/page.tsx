import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

const siteUrl = 'https://blog-three-lac-61.vercel.app'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: { params: Promise<{ mdxPath: string[] }> }) {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  const { canonical, ...rest } = metadata as Record<string, unknown>
  return {
    ...rest,
    ...(canonical ? { alternates: { canonical } } : {}),
  }
}

function BlogPostingJsonLd({ metadata, path }: { metadata: Record<string, unknown>; path: string }) {
  const title = metadata.title as string
  const description = metadata.description as string
  const date = metadata.date as string
  const canonical = metadata.canonical as string

  if (!date) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    datePublished: date,
    dateModified: date,
    url: canonical || `${siteUrl}/${path}`,
    author: {
      '@type': 'Person',
      name: 'Hank',
    },
    publisher: {
      '@type': 'Person',
      name: 'Hank',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical || `${siteUrl}/${path}`,
    },
    image: `${siteUrl}/assets/og-image.png`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props: { params: Promise<{ mdxPath: string[] }> }) {
  const params = await props.params
  const { default: MDXContent, toc, metadata, sourceCode } = await importPage(params.mdxPath)
  const path = params.mdxPath.join('/')
  return (
    <>
      <BlogPostingJsonLd metadata={metadata as Record<string, unknown>} path={path} />
      <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
        <MDXContent params={params} />
      </Wrapper>
    </>
  )
}
