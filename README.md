<p align="center">
  <img src="dashboard_showcase_page.png" alt="FitNest Dashboard" width="800" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);">
</p>

<h1 align="center">FitNest</h1>

<p align="center">
  <strong>Family Fitness Platform — Stronger Together</strong>
  <br>
  A full-stack family fitness tracker built with Next.js 16, TypeScript, and Tailwind CSS 4 — shared workout plans, progress tracking, and family accountability in one app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma 5">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Zod-4-3E67B1?style=flat-square&logo=zod" alt="Zod 4">
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform" alt="React Hook Form">
  <img src="https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square" alt="Zustand 5">
  <img src="https://img.shields.io/badge/Recharts-3-22B5BF?style=flat-square" alt="Recharts">
</p>

---

## About

FitNest is a **production-quality family fitness platform** that brings households together around shared health goals. Families can create or join a shared space, build workout plans for individual members or the whole group, log daily completions, and track progress side-by-side on a unified dashboard.

Built with **Next.js App Router** using React Server Components, Server Actions, and a MySQL database via Prisma. Authentication is handled with JWT tokens stored in HTTP-only cookies — no third-party auth service required. Client state is managed with Zustand; forms use React Hook Form + Zod v4 for validation.

---

## Features

|  |  |  |
|--|--|--|
| **🏠 Family Management** — Create or join families with invite codes, manage member roles (Owner / Member), view family-wide progress | **📋 Workout Plans** — Build custom plans with exercises, scheduled days, difficulty levels, and category tags. Assign plans to any family member | **✅ Completion Tracking** — Log workout status (Pending / In Progress / Completed / Skipped) per day with timestamps |
| **📊 Dashboard** — Real-time family overview: daily completion stats, weekly consistency, active streak, per-member progress cards | **📈 Statistics** — Weekly and monthly charts via Recharts, family leaderboard, consistency calendar, and completion rate breakdowns | **🔔 Notifications** — Family activity feed with typed events (workouts, streaks, achievements, joins) and mark-all-read support |
| **👤 Profile & Settings** — Profile with workout history, streak, and family info. Settings page for account updates | **🔐 JWT Auth** — Cookie-based sessions with `jose`, bcrypt password hashing (12 rounds), protected routes via Next.js middleware | **📱 Responsive** — Mobile-first layout with a fixed bottom nav bar on small screens and a collapsible sidebar on desktop |

---

## Tech Stack

| Frontend | Backend & Data |
|----------|----------------|
| **Next.js 16** (App Router, RSC + Client Components) | **Prisma 5** (MySQL ORM) |
| **Tailwind CSS 4** (`@import "tailwindcss"`) | **MySQL** (via `DATABASE_URL`) |
| **React 19** (Server Actions, `useTransition`) | **jose** (JWT sign & verify) |
| **Zustand 5** (client state store) | **bcryptjs** (password hashing, 12 rounds) |
| **React Hook Form 7** + **Zod 4** (forms & validation) | **Next.js API Routes** (REST endpoints) |
| **Recharts 3** (bar, area charts) | **Server Actions** (`'use server'` mutations) |
| **Radix UI** (Dialog, Select, Toast primitives) | **TypeScript** (strict mode) |
| **Lucide React** (icons) | **ESLint** (Next.js config) |
| **clsx + tailwind-merge** (`cn()` utility) | |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Next.js 16 App Router                        │
│                                                               │
│  app/(auth)/          → Login, Register, Forgot Password      │
│  app/(protected)/     → Dashboard, Family, Workouts, etc.    │
│    └─ layout.tsx      → Session check + Sidebar + MobileNav  │
│  app/api/             → REST API routes (workout-plans, etc.) │
│  server/actions/      → Server Actions (auth, family, workout)│
│                                                               │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Dashboard │ │  Family  │ │Workouts  │ │  Statistics   │  │
│  │ (RSC)     │ │(RSC+form)│ │(RSC+form)│ │  (Recharts)   │  │
│  └───────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 Shared Infrastructure                   │  │
│  │  Sidebar │ MobileNav │ Header │ ToastProvider           │  │
│  │  Zustand Store │ JWT cookies │ Prisma singleton (db.ts) │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  MySQL ←── Prisma 5 ←── lib/db.ts (global singleton)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Routes

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |
| `/dashboard` | Family dashboard |
| `/family-management` | Create / join / manage family |
| `/workout-plans` | Workout plans list |
| `/workout-plans/new` | Create workout plan |
| `/workout-plans/[id]` | Plan detail + completion |
| `/workout-plans/[id]/edit` | Edit workout plan |
| `/statistics` | Charts & leaderboard |
| `/notifications` | Activity & notifications |
| `/settings` | Account settings |
| `/profile` | User profile |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8+ (or MariaDB)
- yarn / npm

### Quick Setup

```bash
# Clone the repository
git clone <repo-url>
cd fitnest

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run database migrations
npx prisma migrate dev --name init

# Start the dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
DATABASE_URL="mysql://root:password@localhost:3306/fitnest"
JWT_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

<details>
<summary>Available commands</summary>

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Production build (also typechecks) |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `npx prisma studio` | Open Prisma DB browser |
| `npx prisma migrate dev` | Run pending migrations |

</details>

---

## Project Structure

```
app/
├── (auth)/             # Login, Register, Forgot Password pages
├── (protected)/        # All authenticated pages + shared layout
│   ├── dashboard/      # Family dashboard (RSC)
│   ├── family-management/
│   ├── workout-plans/  # List, detail, new, edit
│   ├── statistics/
│   ├── notifications/
│   ├── settings/
│   └── profile/
├── api/                # REST API routes
├── globals.css         # Design tokens + Tailwind CSS 4 theme
└── layout.tsx          # Root layout (ToastProvider)
components/
├── auth/               # LoginForm, RegisterForm, ForgotPasswordForm
├── dashboard/          # ActivityFeed, FamilyOverview, MemberCard, ProgressChart
├── family/             # CreateFamilyForm, JoinFamilyForm, MemberList, InviteModal
├── landing/            # Navbar, HeroSection, FeaturesSection, etc.
├── shared/             # Sidebar, MobileNav, Header, ProfileHeader, SettingsForm
├── statistics/         # WeeklyChart, MonthlyChart, FamilyLeaderboard, ConsistencyCalendar
├── ui/                 # Button, Input, Select, Modal, Toast, Avatar, Badge, etc.
└── workout/            # WorkoutForm, WorkoutPlanCard, ExerciseList, CompletionButton
lib/
├── auth.ts             # JWT session helpers (createSession, getSession, deleteSession)
├── db.ts               # Prisma singleton
└── utils.ts            # cn(), calculateStreak(), parseScheduledDays(), etc.
prisma/
├── schema.prisma       # MySQL schema (users, families, workout_plans, etc.)
└── migrations/         # Migration history
server/actions/         # Server Actions: auth, family, workout, notifications, user
store/
└── index.ts            # Zustand global store
types/
└── index.ts            # All shared TypeScript types
```

---

<p align="center">
  <sub>Built with Next.js, TypeScript, and Tailwind CSS — designed for families who move together.</sub>
</p>
