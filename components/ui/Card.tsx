import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'glass'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/8',
        variant === 'default' && 'bg-[#151922]',
        variant === 'glass' && 'bg-white/5 backdrop-blur-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-5 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center p-5 pt-0 border-t border-white/8 mt-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
