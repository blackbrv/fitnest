"use client"

import { create } from "zustand"
import { Family, FamilyMember, User, WorkoutPlan, Notification } from "@/types"

interface AppState {
  user: User | null
  currentFamily: Family | null
  familyMembers: FamilyMember[]
  workoutPlans: WorkoutPlan[]
  notifications: Notification[]
  unreadCount: number

  setUser: (user: User | null) => void
  setCurrentFamily: (family: Family | null) => void
  setFamilyMembers: (members: FamilyMember[]) => void
  setWorkoutPlans: (plans: WorkoutPlan[]) => void
  setNotifications: (notifications: Notification[]) => void
  markNotificationRead: (id: string) => void
  clearStore: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentFamily: null,
  familyMembers: [],
  workoutPlans: [],
  notifications: [],
  unreadCount: 0,

  setUser: (user) => set({ user }),
  setCurrentFamily: (family) => set({ currentFamily: family }),
  setFamilyMembers: (members) => set({ familyMembers: members }),
  setWorkoutPlans: (plans) => set({ workoutPlans: plans }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  clearStore: () =>
    set({
      user: null,
      currentFamily: null,
      familyMembers: [],
      workoutPlans: [],
      notifications: [],
      unreadCount: 0,
    }),
}))
