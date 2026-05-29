'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, Loader2 } from 'lucide-react'
import { createFamily } from '@/server/actions/family'
import type { ActionResult } from '@/types'

const schema = z.object({
  familyName: z
    .string()
    .min(2, 'Family name must be at least 2 characters')
    .max(50, 'Family name must be 50 characters or less'),
})

type FormValues = z.infer<typeof schema>

const initialState: ActionResult = { success: false }

export function CreateFamilyForm() {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    createFamily,
    initialState,
  )

  const {
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="bg-[#151922] rounded-2xl border border-white/8 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#a3ff3f]/10 flex items-center justify-center shrink-0">
          <Users size={20} className="text-[#a3ff3f]" />
        </div>
        <div>
          <h2 className="text-[#f5f7fa] font-semibold text-base">Create a Family</h2>
          <p className="text-[#8b95a5] text-sm">Start your family fitness journey</p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="familyName" className="text-sm font-medium text-[#f5f7fa]">
            Family Name
          </label>
          <input
            id="familyName"
            {...register('familyName')}
            name="familyName"
            type="text"
            placeholder="e.g. The Johnsons"
            autoComplete="off"
            className="w-full bg-[#1c2433] border border-white/8 rounded-xl px-4 py-3 text-[#f5f7fa] placeholder-[#8b95a5] focus:outline-none focus:border-[#a3ff3f]/50 focus:ring-1 focus:ring-[#a3ff3f]/25 transition-all"
          />
          {errors.familyName && (
            <p className="text-red-400 text-xs mt-0.5">{errors.familyName.message}</p>
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
              Creating…
            </>
          ) : (
            'Create Family'
          )}
        </button>
      </form>
    </div>
  )
}
