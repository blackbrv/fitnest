import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Blog — FitNest',
}

async function getPosts() {
  try {
    return await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        authorName: true,
        publishedAt: true,
        tags: true,
      },
    })
  } catch {
    return []
  }
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Blog</h1>
        <p className="text-muted leading-relaxed">
          Fitness tips, family insights, and product updates.
        </p>
      </div>

      {/* Post grid */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-foreground font-semibold mb-2">No posts yet</p>
          <p className="text-muted text-sm">
            We&apos;re working on some great content. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            let tags: string[] = []
            try {
              tags = JSON.parse(post.tags ?? '[]')
            } catch {
              tags = []
            }

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-2xl border border-border bg-surface p-6 hover:bg-surface-2 transition-colors block group"
              >
                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>{post.authorName}</span>
                  {post.publishedAt && (
                    <>
                      <span>·</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
