export type UserRole = "OWNER" | "MEMBER"

export type WorkoutDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export type WorkoutCategory =
  | "STRENGTH"
  | "CARDIO"
  | "STRETCHING"
  | "MOBILITY"
  | "KIDS_EXERCISE"
  | "RECOVERY"

export type WorkoutStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED"

export type NotificationType =
  | "WORKOUT_REMINDER"
  | "STREAK_REMINDER"
  | "FAMILY_ACTIVITY"
  | "MISSED_WORKOUT"
  | "GENERAL"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  emailVerified: boolean
  createdAt: Date
}

export interface Family {
  id: string
  familyName: string
  inviteCode: string
  ownerId: string
  createdAt: Date
}

export interface FamilyMember {
  id: string
  familyId: string
  userId: string
  role: UserRole
  joinedAt: Date
  user?: User
}

export interface WorkoutPlan {
  id: string
  familyId: string
  assignedTo?: string | null
  title: string
  description?: string | null
  difficulty: WorkoutDifficulty
  category: WorkoutCategory
  scheduledDays: string[]
  notes?: string | null
  isActive: boolean
  createdAt: Date
  exercises?: WorkoutExercise[]
}

export interface WorkoutExercise {
  id: string
  workoutPlanId: string
  exerciseName: string
  sets: number
  reps?: number | null
  duration?: number | null
  restSeconds?: number | null
  order: number
}

export interface WorkoutLog {
  id: string
  userId: string
  workoutPlanId: string
  status: WorkoutStatus
  completedAt?: Date | null
  notes?: string | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export interface DashboardStatistics {
  totalMembers: number
  dailyCompletionRate: number
  weeklyConsistency: number
  totalWorkoutsCompleted: number
  mostActiveMember: string
}

export interface MemberStats {
  workoutsCompleted: number
  totalReps: number
  activeDays: number
  currentStreak: number
  consistencyRate: number
  todayStatus: WorkoutStatus | null
  assignedWorkout?: WorkoutPlan | null
  completionPercentage: number
}

export interface SessionPayload {
  userId: string
  email: string
  name: string
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface WorkoutCompletionPayload {
  workoutLogId: string
  notes?: string
}

export interface CreateWorkoutPlanPayload {
  title: string
  description?: string
  difficulty: WorkoutDifficulty
  category: WorkoutCategory
  scheduledDays: string[]
  notes?: string
  assignedTo?: string
  exercises: Omit<WorkoutExercise, "id" | "workoutPlanId">[]
}
