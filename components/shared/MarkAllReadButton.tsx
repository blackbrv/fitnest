'use client'

import { useTransition } from 'react'
import { CheckCheck } from 'lucide-react'
import { markAllNotificationsRead } from '@/server/actions/notifications'
import { cn } from '@/lib/utils'

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await markAllNotificationsRead()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-border',
        'bg-surface-2 px-3 py-2 text-sm font-medium text-foreground',
        'hover:bg-surface-3 transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-40',
      )}
    >
      <CheckCheck size={15} className="text-primary" />
      {isPending ? 'Marking…' : 'Mark all read'}
    </button>
  )
}
