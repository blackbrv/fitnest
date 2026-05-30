import { CheckCircle2, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { WorkoutLog } from '@/types'

interface ExtendedWorkoutLog extends WorkoutLog {
  workoutPlan?: { title: string; category: string } | null
}

interface ProfileActivityProps {
  recentActivity: ExtendedWorkoutLog[]
}

const categoryColors: Record<string, string> = {
  STRENGTH: 'text-primary bg-primary/10',
  CARDIO: 'text-blue-400 bg-blue-400/10',
  STRETCHING: 'text-purple-400 bg-purple-400/10',
  MOBILITY: 'text-cyan-400 bg-cyan-400/10',
  KIDS_EXERCISE: 'text-yellow-400 bg-yellow-400/10',
  RECOVERY: 'text-orange-400 bg-orange-400/10',
}

const categoryLabels: Record<string, string> = {
  STRENGTH: 'Strength',
  CARDIO: 'Cardio',
  STRETCHING: 'Stretching',
  MOBILITY: 'Mobility',
  KIDS_EXERCISE: 'Kids',
  RECOVERY: 'Recovery',
}

const mockActivity: ExtendedWorkoutLog[] = [
  {
    id: '1',
    userId: 'mock',
    workoutPlanId: 'wp1',
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    workoutPlan: { title: 'Leg Day', category: 'STRENGTH' },
  },
  {
    id: '2',
    userId: 'mock',
    workoutPlanId: 'wp2',
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    workoutPlan: { title: 'Morning Run', category: 'CARDIO' },
  },
  {
    id: '3',
    userId: 'mock',
    workoutPlanId: 'wp3',
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    workoutPlan: { title: 'Upper Body Strength', category: 'STRENGTH' },
  },
  {
    id: '4',
    userId: 'mock',
    workoutPlanId: 'wp4',
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - 74 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 74 * 60 * 60 * 1000),
    workoutPlan: { title: 'Evening Stretch', category: 'STRETCHING' },
  },
]

export function ProfileActivity({ recentActivity }: ProfileActivityProps) {
  const activity = recentActivity.length > 0 ? recentActivity : mockActivity

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Recent Activity</h2>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Clock size={28} className="text-muted mb-3" />
          <p className="text-sm font-semibold text-foreground">No activity yet</p>
          <p className="text-xs text-muted mt-1">
            Complete your first workout to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activity.map((log) => {
            const category = log.workoutPlan?.category ?? 'STRENGTH'
            const colorClass = categoryColors[category] ?? 'text-muted bg-white/8'
            const categoryLabel = categoryLabels[category] ?? category

            return (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-2/40 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 size={15} className="text-primary" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {log.workoutPlan?.title ?? 'Workout'}
                  </p>
                  <p className="text-xs text-muted">
                    {log.completedAt ? formatRelativeTime(log.completedAt) : 'Completed'}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
                >
                  {categoryLabel}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
