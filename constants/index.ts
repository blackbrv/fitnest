export const WORKOUT_CATEGORIES = [
  { value: "STRENGTH", label: "Strength" },
  { value: "CARDIO", label: "Cardio" },
  { value: "STRETCHING", label: "Stretching" },
  { value: "MOBILITY", label: "Mobility" },
  { value: "KIDS_EXERCISE", label: "Kids Exercise" },
  { value: "RECOVERY", label: "Recovery" },
] as const

export const WORKOUT_DIFFICULTIES = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const

export const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
] as const

export const USER_ROLES = {
  OWNER: "OWNER",
  MEMBER: "MEMBER",
} as const

export const WORKOUT_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  SKIPPED: "SKIPPED",
} as const

export const MAX_WORKOUT_PER_DAY = 5
export const DEFAULT_REST_DURATION = 60
export const MAX_FAMILY_MEMBERS = 10
export const STREAK_THRESHOLD_DAYS = 7

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  FAMILY: "/family-management",
  WORKOUTS: "/workout-plans",
  STATISTICS: "/statistics",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const

export const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { label: "Family", href: ROUTES.FAMILY, icon: "Users" },
  { label: "Workouts", href: ROUTES.WORKOUTS, icon: "Dumbbell" },
  { label: "Statistics", href: ROUTES.STATISTICS, icon: "BarChart3" },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: "Bell" },
] as const
