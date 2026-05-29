import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("")
}

export function calculateStreak(completedDates: Date[]): number {
  if (!completedDates.length) return 0

  const sorted = [...completedDates].sort((a, b) => b.getTime() - a.getTime())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = today

  for (const date of sorted) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === checkDate.getTime()) {
      streak++
      checkDate = new Date(checkDate.getTime() - 86400000)
    } else if (d < checkDate) {
      break
    }
  }
  return streak
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function calculateCompletionRate(
  completed: number,
  total: number
): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function parseScheduledDays(days: string | string[]): string[] {
  if (Array.isArray(days)) return days
  try {
    const parsed = JSON.parse(days)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
