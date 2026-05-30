'use client'

import { useState } from 'react'
import { type LucideIcon, User, Users, Bell, Shield, LogOut, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SettingsForm } from './SettingsForm'
import { logoutUser } from '@/server/actions/auth'

const ICON_MAP: Record<string, LucideIcon> = {
  profile: User,
  family: Users,
  notifications: Bell,
  account: Shield,
}

interface Tab {
  id: string
  label: string
}

interface SettingsTabsProps {
  tabs: Tab[]
  defaultValues: { name: string; email: string }
  familyName: string | null
}

export function SettingsTabs({ tabs, defaultValues, familyName }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Tab sidebar */}
      <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:w-52 shrink-0">
        {tabs.map((tab) => {
          const Icon = ICON_MAP[tab.id] ?? User
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150 text-left',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-white/5',
              )}
            >
              <Icon size={16} className="shrink-0" />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Tab content */}
      <div className="flex-1 min-w-0">
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-base font-semibold text-foreground mb-5">Profile Settings</h2>
            <SettingsForm defaultValues={defaultValues} />
          </div>
        )}

        {activeTab === 'family' && (
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Family Settings</h2>
            {familyName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Users size={17} className="text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{familyName}</p>
                    <p className="text-xs text-muted">Your family group</p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Manage your family members from the{' '}
                  <a href="/family-management" className="text-primary hover:underline">
                    Family Management
                  </a>{' '}
                  page.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users size={28} className="text-muted mb-3" />
                <p className="text-sm font-semibold text-foreground">No family group yet</p>
                <p className="text-xs text-muted mt-1">
                  Create or join a family from the Family Management page
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
            <p className="text-sm text-muted">
              Manage your notification preferences from the Profile Settings tab.
              Your preferences are saved along with your profile.
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2/50 p-4">
              <Bell size={17} className="text-primary" />
              <p className="text-sm text-muted">
                Go to Profile settings to configure notification types
              </p>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Account</h2>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Session
              </p>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border border-border',
                    'bg-surface-2/40 px-4 py-3 text-sm font-medium text-foreground',
                    'hover:bg-surface-2 transition-colors duration-150',
                  )}
                >
                  <LogOut size={15} className="text-muted" />
                  Sign out of FitNest
                </button>
              </form>
            </div>

            <div className="space-y-2 border-t border-border pt-5">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                Danger Zone
              </p>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-muted mt-1 mb-3">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                <button
                  type="button"
                  disabled
                  className={cn(
                    'flex items-center gap-2 rounded-xl bg-red-600/20 border border-red-600/30',
                    'px-3 py-2 text-xs font-medium text-red-400',
                    'opacity-60 cursor-not-allowed',
                  )}
                >
                  <Trash2 size={13} />
                  Delete Account
                </button>
                <p className="text-xs text-muted/60 mt-2">
                  Contact support to delete your account
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
