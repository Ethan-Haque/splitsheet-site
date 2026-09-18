import { Table2 } from 'lucide-react'
import type { ChartColor, Person } from '@/lib/expense-data'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border-border bg-card hover:bg-muted',
  ghost: 'hover:bg-muted',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'h-9 gap-1.5 px-3 text-sm',
  lg: 'h-11 gap-2 px-5 text-[0.95rem]',
}

/** Button look for links and buttons alike; the page's CTAs are all links. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg border border-transparent font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
  )
}

/** Same mark as the app's sign-in screen. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Table2 className="size-[18px]" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight">Splitsheet</span>
    </span>
  )
}

export const CHART_BG: Record<ChartColor, string> = {
  1: 'bg-chart-1',
  2: 'bg-chart-2',
  3: 'bg-chart-3',
  4: 'bg-chart-4',
  5: 'bg-chart-5',
}

const AVATAR_SIZES = {
  sm: 'size-5 text-[10px]',
  md: 'size-7 text-xs',
} as const

/** The app's member avatar: an initial on the member's palette color. */
export function Avatar({
  person,
  size = 'md',
  faded = false,
  className,
}: {
  person: Pick<Person, 'name' | 'color'>
  size?: keyof typeof AVATAR_SIZES
  faded?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white transition-opacity',
        CHART_BG[person.color],
        AVATAR_SIZES[size],
        faded && 'opacity-25',
        className,
      )}
      aria-hidden
    >
      {person.name.slice(0, 1).toUpperCase()}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'left',
}: {
  eyebrow: string
  title: React.ReactNode
  children?: React.ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')} data-reveal>
      <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {children && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          {children}
        </p>
      )}
    </div>
  )
}

/** Window chrome around an app screenshot, so it reads as the product, not a picture. */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/40',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-background px-2.5 py-0.5 text-center font-mono text-[11px] text-muted-foreground">
          {url}
        </span>
        <span className="w-[42px]" aria-hidden />
      </div>
      {children}
    </div>
  )
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>
}
