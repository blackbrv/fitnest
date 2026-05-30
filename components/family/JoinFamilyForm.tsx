'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn, Loader2 } from 'lucide-react'
import { joinFamily } from '@/server/actions/family'
import type { ActionResult } from '@/types'

const schema = z.object({
  inviteCode: z
    .string()
    .length(8, 'Invite code must be exactly 8 characters')
    .regex(/^[A-Z0-9]+$/i, 'Invite code must contain only letters and numbers'),
})

type FormValues = z.infer<typeof schema>

const initialState: ActionResult = { success: false }

export function JoinFamilyForm() {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    joinFamily,
    initialState,
  )

  const {
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="bg-surface rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <LogIn size={20} className="text-muted" />
        </div>
        <div>
          <h2 className="text-foreground font-semibold text-base">Join a Family</h2>
          <p className="text-muted text-sm">Enter an invite code to join</p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inviteCode" className="text-sm font-medium text-foreground">
            Invite Code
          </label>
          <input
            id="inviteCode"
            {...register('inviteCode')}
            name="inviteCode"
            type="text"
            placeholder="e.g. AB12CD34"
            autoComplete="off"
            maxLength={8}
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-[#a3ff3f]/50 focus:ring-1 focus:ring-[#a3ff3f]/25 transition-all tracking-widest uppercase font-mono"
          />
          {errors.inviteCode && (
            <p className="text-red-400 text-xs mt-0.5">{errors.inviteCode.message}</p>
          )}
        </div>

        {state?.error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#a3ff3f] text-[#0f1115] font-semibold px-6 py-3 rounded-xl hover:bg-[#7acc2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Joining…
            </>
          ) : (
            'Join Family'
          )}
        </button>

        <p className="text-center text-sm text-muted">
          Don&apos;t have a code?{' '}
          <span className="text-foreground">Ask your family owner.</span>
        </p>
      </form>
    </div>
  )
}
