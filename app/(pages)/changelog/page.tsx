import type { Metadata } from 'next'
import { execSync } from 'child_process'

export const metadata: Metadata = {
  title: 'Changelog — FitNest',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommitEntry {
  hash: string
  message: string
  date: string
  type: string
  description: string
}

// ─── Git log ──────────────────────────────────────────────────────────────────

function getChangelog(): CommitEntry[] {
  try {
    const output = execSync(
      'git log --format="%H|%s|%ad" --date=format:"%Y-%m-%d" -n 60',
      { cwd: process.cwd(), encoding: 'utf-8' },
    ).trim()

    if (!output) return []

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|')
        const hash = parts[0]?.slice(0, 7) ?? ''
        const message = parts[1] ?? ''
        const date = parts[2] ?? ''

        const colonIdx = message.indexOf(':')
        const type = colonIdx > -1 ? message.slice(0, colonIdx).trim() : 'Other'
        const description =
          colonIdx > -1 ? message.slice(colonIdx + 1).trim() : message

        return { hash, message, date, type, description }
      })
      .filter((c) =>
        ['Add', 'Update', 'Fix', 'Remove', 'Refactor', 'Docs', 'Chore'].includes(
          c.type,
        ),
      )
  } catch {
    return []
  }
}

// ─── Group by month ───────────────────────────────────────────────────────────

interface MonthGroup {
  label: string
  items: CommitEntry[]
}

function groupByMonth(commits: CommitEntry[]): MonthGroup[] {
  const groups = new Map<string, CommitEntry[]>()
  for (const commit of commits) {
    const [year, month] = commit.date.split('-')
    const key = `${year}-${month}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(commit)
  }
  return Array.from(groups.entries()).map(([key, items]) => {
    const [year, month] = key.split('-')
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(
      'en-US',
      { month: 'long', year: 'numeric' },
    )
    return { label, items }
  })
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  Add: 'bg-emerald-500/15 text-emerald-400',
  Fix: 'bg-red-500/15 text-red-400',
  Update: 'bg-blue-500/15 text-blue-400',
  Remove: 'bg-orange-500/15 text-orange-400',
  Refactor: 'bg-purple-500/15 text-purple-400',
  Docs: 'bg-cyan-500/15 text-cyan-400',
  Chore: 'bg-surface-2 text-muted',
}

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_STYLES[type] ?? 'bg-surface-2 text-muted'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${cls}`}>
      {type}
    </span>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChangelogPage() {
  const commits = getChangelog()
  const groups = groupByMonth(commits)

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-3">Changelog</h1>
        <p className="text-muted leading-relaxed">What&apos;s new in FitNest.</p>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <p className="text-foreground font-semibold mb-2">No changelog entries found</p>
          <p className="text-muted text-sm">
            Commit history is unavailable in this environment.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(({ label, items }) => (
            <section key={label}>
              {/* Month header */}
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">
                  {label}
                </h2>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Commits */}
              <div className="space-y-2">
                {items.map((commit) => (
                  <div
                    key={commit.hash}
                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-surface transition-colors group"
                  >
                    {/* Hash chip */}
                    <span className="font-mono text-xs bg-surface-2 text-muted px-2 py-0.5 rounded shrink-0">
                      {commit.hash}
                    </span>

                    {/* Type badge */}
                    <TypeBadge type={commit.type} />

                    {/* Description */}
                    <span className="text-sm text-muted leading-snug flex-1 min-w-0 truncate">
                      {commit.description}
                    </span>

                    {/* Date */}
                    <span className="text-xs text-muted shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      {commit.date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
