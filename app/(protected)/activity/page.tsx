import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn, getInitials } from "@/lib/utils";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
} from "lucide-react";
import { ActivityFilters } from "./ActivityFilters";

export const metadata: Metadata = {
  title: "All Activity — FitNest",
};

type WorkoutStatus = "COMPLETED" | "SKIPPED" | "IN_PROGRESS";

interface ActivityRow {
  id: string;
  memberName: string;
  status: WorkoutStatus;
  workoutTitle: string;
  category: string | null;
  dateLabel: string;
  timeLabel: string;
  sortKey: number;
}

interface ActivityFilters {
  status?: string;
  member?: string;    // userId
  category?: string;
  date?: string;      // "today" | "week" | (default = last 30 days)
  workout?: string;   // workoutPlanId
  search?: string;    // member name text search
}

const STATUS_CONFIG: Record<
  WorkoutStatus,
  {
    icon: React.ElementType;
    label: string;
    badgeClass: string;
    iconClass: string;
  }
> = {
  COMPLETED: {
    icon: CheckCircle2,
    label: "Completed",
    badgeClass: "bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20",
    iconClass: "text-emerald-400",
  },
  SKIPPED: {
    icon: XCircle,
    label: "Skipped",
    badgeClass: "bg-white/6 text-muted ring-1 ring-white/10",
    iconClass: "text-muted",
  },
  IN_PROGRESS: {
    icon: Clock,
    label: "In Progress",
    badgeClass: "bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20",
    iconClass: "text-amber-400",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  STRENGTH: "Strength",
  CARDIO: "Cardio",
  STRETCHING: "Stretching",
  MOBILITY: "Mobility",
  KIDS_EXERCISE: "Kids",
  RECOVERY: "Recovery",
};

const CATEGORY_COLORS: Record<string, string> = {
  STRENGTH: "bg-blue-500/12 text-blue-400",
  CARDIO: "bg-orange-500/12 text-orange-400",
  STRETCHING: "bg-purple-500/12 text-purple-400",
  MOBILITY: "bg-cyan-500/12 text-cyan-400",
  KIDS_EXERCISE: "bg-pink-500/12 text-pink-400",
  RECOVERY: "bg-green-500/12 text-green-400",
};

function toDateLabel(date: Date, now: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const n = new Date(now);
  n.setHours(0, 0, 0, 0);
  const diff = Math.round((n.getTime() - d.getTime()) / 86_400_000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toTimeLabel(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getActivityData(
  userId: string,
  filters: ActivityFilters,
): Promise<{
  rows: ActivityRow[];
  totalCount: number;
  members: { userId: string; name: string }[];
  workoutPlans: { id: string; title: string }[];
}> {
  try {
    const membership = await db.familyMember.findFirst({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!membership) {
      return { rows: [], totalCount: 0, members: [], workoutPlans: [] };
    }

    const allMembers: { userId: string; name: string }[] = membership.family.members.map((m) => ({
      userId: m.userId as string,
      name: m.user.name as string,
    }));

    const memberNameMap = new Map<string, string>(
      allMembers.map((m) => [m.userId, m.name]),
    );

    // ── Apply member name search ─────────────────────────────────────────────
    const searchTerm = filters.search?.trim().toLowerCase();
    const searchMatchedIds = searchTerm
      ? allMembers
          .filter((m) => m.name.toLowerCase().includes(searchTerm))
          .map((m) => m.userId)
      : allMembers.map((m) => m.userId);

    // ── Apply exact member dropdown filter ───────────────────────────────────
    const targetUserIds = filters.member
      ? searchMatchedIds.filter((id) => id === filters.member)
      : searchMatchedIds;

    // ── Date range ───────────────────────────────────────────────────────────
    const now = new Date();
    let fromDate: Date;

    if (filters.date === "today") {
      fromDate = new Date(now);
      fromDate.setHours(0, 0, 0, 0);
    } else if (filters.date === "week") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      fromDate.setHours(0, 0, 0, 0);
    } else {
      // Default: last 30 days
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - 30);
      fromDate.setHours(0, 0, 0, 0);
    }

    // ── Status filter ────────────────────────────────────────────────────────
    const validStatuses = ["COMPLETED", "SKIPPED", "IN_PROGRESS", "PENDING"];
    const statusUpper = filters.status?.toUpperCase();
    const statusWhere =
      statusUpper && validStatuses.includes(statusUpper)
        ? { status: statusUpper as WorkoutStatus }
        : {};

    // ── Category + workout plan filters (nested on relation) ─────────────────
    const categoryUpper = filters.category?.toUpperCase();
    const workoutPlanWhere: Record<string, unknown> = {};
    if (categoryUpper) workoutPlanWhere.category = categoryUpper;

    const workoutWhere = filters.workout ? { workoutPlanId: filters.workout } : {};

    // Bail early if search/member filters produced no matching members
    if (targetUserIds.length === 0) {
      const workoutPlans = await db.workoutPlan.findMany({
        where: { familyId: membership.familyId, isActive: true },
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      });
      return { rows: [], totalCount: 0, members: allMembers, workoutPlans };
    }

    // ── Fetch logs ───────────────────────────────────────────────────────────
    const logs = await db.workoutLog.findMany({
      where: {
        userId: { in: targetUserIds },
        createdAt: { gte: fromDate },
        ...statusWhere,
        ...workoutWhere,
        ...(Object.keys(workoutPlanWhere).length > 0
          ? { workoutPlan: workoutPlanWhere }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { workoutPlan: { select: { title: true, category: true } } },
    });

    // ── Fetch workout plans list for filter dropdown ──────────────────────────
    const workoutPlans = await db.workoutPlan.findMany({
      where: { familyId: membership.familyId, isActive: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });

    // ── Build rows ───────────────────────────────────────────────────────────
    const rows: ActivityRow[] = logs.map((log) => {
      const ts = new Date(log.completedAt ?? log.createdAt);
      return {
        id: log.id,
        memberName: memberNameMap.get(log.userId) ?? "Unknown",
        status: log.status as WorkoutStatus,
        workoutTitle: log.workoutPlan?.title ?? "—",
        category: log.workoutPlan?.category ?? null,
        dateLabel: toDateLabel(ts, now),
        timeLabel: toTimeLabel(ts),
        sortKey: ts.getTime(),
      };
    });

    return { rows, totalCount: rows.length, members: allMembers, workoutPlans };
  } catch (err) {
    console.error("[getActivityData]", err);
    return { rows: [], totalCount: 0, members: [], workoutPlans: [] };
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkoutStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.SKIPPED;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cfg.badgeClass,
      )}
    >
      <Icon size={11} className={cfg.iconClass} />
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-muted">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        CATEGORY_COLORS[category] ?? "bg-white/6 text-muted",
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

function MemberAvatar({ name, status }: { name: string; status: WorkoutStatus }) {
  const ringClass =
    status === "COMPLETED"
      ? "ring-emerald-400/25"
      : status === "IN_PROGRESS"
        ? "ring-amber-400/25"
        : "ring-white/10";
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-surface-2 text-[10px] font-bold text-foreground ring-1",
        ringClass,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    member?: string;
    category?: string;
    date?: string;
    workout?: string;
    search?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status, member, category, date, workout, search } = await searchParams;

  const { rows, totalCount, members, workoutPlans } = await getActivityData(
    session.userId,
    { status, member, category, date, workout, search },
  );

  const hasActiveFilters = !!(status || member || category || date || workout || search);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Activity</h1>
          <p className="text-sm text-muted mt-1">
            Family workout history · {date === "today" ? "today" : date === "week" ? "last 7 days" : "last 30 days"}
          </p>
        </div>
        {totalCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-2 border border-border px-3 py-1.5 text-xs font-semibold text-foreground self-center">
            {totalCount} {totalCount === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {/* Filters — client component, Suspense required for useSearchParams */}
      <Suspense>
        <ActivityFilters members={members} workoutPlans={workoutPlans} />
      </Suspense>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {rows.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-12 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
            <Dumbbell size={22} className="text-muted" />
          </span>
          <p className="text-sm font-semibold text-foreground">No activity found</p>
          <p className="text-xs text-muted max-w-xs">
            {hasActiveFilters
              ? "No results match your current filters. Try adjusting or clearing them."
              : "Complete your first workout to see activity here."}
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <>
          {/* ── Desktop table (md+) ────────────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/50">
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-widest w-[180px]">
                    Date & Time
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-widest">
                    Member
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-widest">
                    Workout
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-widest w-[120px]">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-muted uppercase tracking-widest w-[130px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-surface-2/40 transition-colors duration-100"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-xs font-medium text-foreground">{row.dateLabel}</p>
                      <p className="text-[11px] text-muted mt-0.5">{row.timeLabel}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar name={row.memberName} status={row.status} />
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                          {row.memberName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                        {row.workoutTitle}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={row.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-border px-5 py-3 bg-surface-2/20">
              <p className="text-[11px] text-muted">
                Showing {rows.length} {rows.length === 1 ? "entry" : "entries"}
                {hasActiveFilters ? " · filtered results" : " · last 30 days"}
              </p>
            </div>
          </div>

          {/* ── Mobile card list (<md) ──────────────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {rows.map((row) => {
              const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.SKIPPED;
              const Icon = cfg.icon;
              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3.5"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MemberAvatar name={row.memberName} status={row.status} />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {row.memberName}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                        cfg.badgeClass,
                      )}
                    >
                      <Icon size={10} className={cfg.iconClass} />
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-foreground truncate mb-2">
                    {row.workoutTitle}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={row.category} />
                    <span className="text-[11px] text-muted whitespace-nowrap">
                      {row.dateLabel} · {row.timeLabel}
                    </span>
                  </div>
                </div>
              );
            })}

            <p className="text-center text-[11px] text-muted pt-2">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
              {hasActiveFilters ? " · filtered results" : " · last 30 days"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
