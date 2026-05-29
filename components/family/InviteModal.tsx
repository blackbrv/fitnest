'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Copy, Check, Share2, X } from 'lucide-react'

interface InviteModalProps {
  inviteCode: string
  familyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteModal({ inviteCode, familyName, open, onOpenChange }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = inviteCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleShare() {
    const shareText = `Join our family "${familyName}" on FitNest! Use invite code: ${inviteCode}`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Join ${familyName} on FitNest`,
          text: shareText,
        })
      } catch {
        // User cancelled share — no-op
      }
    } else {
      // Fallback: copy share text to clipboard
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/8 bg-[#151922] shadow-2xl shadow-black/50 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-white/8 p-5">
            <div>
              <Dialog.Title className="text-base font-semibold text-[#f5f7fa]">
                Invite to {familyName}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-[#8b95a5] mt-0.5">
                Share this code with family members
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg p-1 text-[#8b95a5] transition-colors hover:bg-white/8 hover:text-[#f5f7fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3ff3f]/50">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-6">
            {/* Invite code display */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-[#8b95a5] text-xs font-medium uppercase tracking-wider">
                Family Invite Code
              </p>
              <div className="w-full rounded-xl bg-[#0f1115] border border-[#a3ff3f]/20 px-6 py-5 text-center">
                <span className="text-[#a3ff3f] text-3xl font-bold tracking-[0.2em] font-mono select-all">
                  {inviteCode}
                </span>
              </div>
              <p className="text-[#8b95a5] text-xs text-center">
                This code never expires. Members use it to join your family.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 w-full bg-[#a3ff3f] text-[#0f1115] font-semibold px-6 py-3 rounded-xl hover:bg-[#7acc2e] transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Code
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full bg-[#1c2433] border border-white/8 text-[#f5f7fa] font-semibold px-6 py-3 rounded-xl hover:bg-[#242e40] transition-colors"
              >
                <Share2 size={16} />
                Share Invite
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
