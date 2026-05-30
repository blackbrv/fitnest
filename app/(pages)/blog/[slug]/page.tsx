import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react'

// ─── Data fetching ───────────────────────────────────────────────────────────

async function getPost(slug: string) {
  try {
    return await db.blogPost.findUnique({
      where: { slug, status: 'PUBLISHED' },
    })
  } catch {
    return null
  }
}

async function getPublishedSlugs() {
  try {
    const posts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
    })
    return posts.map((p) => p.slug)
  } catch {
    return []
  }
}

// ─── Static params ───────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found — FitNest' }
  return { title: `${post.title} — FitNest` }
}

// ─── Content renderer ────────────────────────────────────────────────────────

function renderContent(content: string) {
  const blocks = content.split(/\n\n+/)

  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Heading: ## ...
    if (trimmed.startsWith('## ')) {
      return (
        <h2
          key={i}
          className="text-xl font-bold text-foreground mt-8 mb-3"
        >
          {trimmed.slice(3)}
        </h2>
      )
    }

    // List: lines starting with "- "
    if (trimmed.split('\n').every((line) => line.trimStart().startsWith('- '))) {
      const items = trimmed
        .split('\n')
        .map((line) => line.trimStart().slice(2).trim())
        .filter(Boolean)
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 mb-4">
          {items.map((item, j) => (
            <li key={j} className="text-muted leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )
    }

    // Default: paragraph
    return (
      <p key={i} className="text-muted leading-relaxed mb-4">
        {trimmed}
      </p>
    )
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  let tags: string[] = []
  try {
    tags = JSON.parse(post.tags ?? '[]')
  } catch {
    tags = []
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-10"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Post header */}
      <div className="mb-10">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Tag className="w-3.5 h-3.5 text-muted mt-0.5" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5">
          {post.title}
        </h1>

        {/* Author + date */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {post.authorName}
          </span>
          {publishedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {publishedDate}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Content */}
      <article className="max-w-none">
        {renderContent(post.content)}
      </article>

      {/* Footer divider */}
      <div className="border-t border-border mt-12 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    </div>
  )
}
