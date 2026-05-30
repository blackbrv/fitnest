'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { updateProfile } from '@/server/actions/user'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Trash2 } from 'lucide-react'

const MAX_AVATAR_SIZE = 2_097_152 // 2MB

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  bio: z.string().max(300, 'Bio must be 300 characters or less').optional(),
  avatar: z.string().optional(),
  workoutReminder: z.boolean(),
  streakReminder: z.boolean(),
  familyActivity: z.boolean(),
  missedWorkout: z.boolean(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface SettingsFormProps {
  defaultValues: {
    name: string
    email: string
    bio: string
    avatar: string
  }
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string>(defaultValues.avatar)
  const [avatarSizeError, setAvatarSizeError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultValues.name,
      bio: defaultValues.bio,
      avatar: defaultValues.avatar,
      workoutReminder: true,
      streakReminder: true,
      familyActivity: true,
      missedWorkout: false,
    },
  })

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarSizeError('')
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl.length > MAX_AVATAR_SIZE) {
        setAvatarSizeError('Image is too large (max 2MB). Please choose a smaller image.')
        return
      }
      setAvatarPreview(dataUrl)
      setValue('avatar', dataUrl, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveAvatar() {
    setAvatarPreview('')
    setValue('avatar', '', { shouldDirty: true })
    setAvatarSizeError('')
  }

  async function onSubmit(values: ProfileFormValues) {
    setStatus('idle')
    const result = await updateProfile({
      name: values.name,
      bio: values.bio,
      avatar: values.avatar,
    })
    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Something went wrong')
    }
  }

  const notificationPrefs = [
    { name: 'workoutReminder' as const, label: 'Workout Reminders', description: 'Get reminded about scheduled workouts' },
    { name: 'streakReminder' as const, label: 'Streak Reminders', description: 'Alerts when your streak is at risk' },
    { name: 'familyActivity' as const, label: 'Family Activity', description: 'Notifications when family members complete workouts' },
    { name: 'missedWorkout' as const, label: 'Missed Workouts', description: 'Alerts when you miss a scheduled workout' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Profile
        </h3>
        <div className="space-y-3">
          {/* Avatar picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-surface-2 ring-1 ring-border flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {defaultValues.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label
                  className={cn(
                    'cursor-pointer rounded-xl border border-border bg-surface-2/60 px-3 py-2',
                    'text-sm font-medium text-foreground hover:bg-surface-2 transition-colors duration-150',
                    'inline-flex items-center gap-2',
                  )}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                  Change photo
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    aria-label="Remove profile picture"
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-xl',
                      'border border-border bg-surface-2/60',
                      'text-muted hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/8',
                      'transition-colors duration-150',
                    )}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
            {avatarSizeError && (
              <p className="text-xs text-red-400">{avatarSizeError}</p>
            )}
            <p className="text-xs text-muted">JPG, PNG or WebP. Max 2MB.</p>
          </div>

          <Input
            label="Display Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="Your full name"
          />

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell your family a little about yourself..."
              className={cn(
                'w-full rounded-xl bg-surface-2/60 px-3.5 py-2.5 text-sm',
                'border border-border outline-none text-foreground placeholder:text-muted',
                'focus:ring-1 focus:ring-primary/60 focus:border-primary/60',
                'resize-none transition-colors duration-150',
                errors.bio && 'border-red-500/60',
              )}
            />
            {errors.bio && (
              <p className="text-xs text-red-400">{errors.bio.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={defaultValues.email}
              disabled
              readOnly
              className={cn(
                'h-10 w-full rounded-xl bg-surface-2/60 px-3.5 text-sm',
                'border border-border outline-none text-muted',
                'cursor-not-allowed opacity-60',
              )}
            />
            <p className="text-xs text-muted">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Notifications
        </h3>
        <div className="space-y-2">
          {notificationPrefs.map((pref) => (
            <label
              key={pref.name}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4',
                'border-border bg-surface-2/40 hover:bg-surface-2/80',
                'transition-colors duration-150',
              )}
            >
              <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  {...register(pref.name)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    'h-5 w-5 rounded-md border-2 border-white/20',
                    'peer-checked:border-[#a3ff3f] peer-checked:bg-[#a3ff3f]',
                    'transition-colors duration-150',
                  )}
                />
                <svg
                  className="pointer-events-none absolute h-3 w-3 text-[#0f1115] opacity-0 peer-checked:opacity-100"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{pref.label}</p>
                <p className="text-xs text-muted mt-0.5">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">Profile updated successfully</p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Save button */}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        disabled={!isDirty || isSubmitting}
        className="w-full sm:w-auto"
      >
        Save Changes
      </Button>
    </form>
  )
}
