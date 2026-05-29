import { ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  name?: string
  size?: AvatarSize
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
}

export function Avatar({ src, name, size = 'md', className, alt, ...props }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'
  const label = alt ?? name ?? 'Avatar'

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center rounded-full',
        'overflow-hidden ring-1 ring-white/10',
        sizeClasses[size],
        className,
      )}
      aria-label={label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-[#1c2433] font-semibold text-[#a3ff3f]"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
    </span>
  )
}
