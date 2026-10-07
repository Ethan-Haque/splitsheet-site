'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Plus } from 'lucide-react'
import { CHART_BG } from '@/components/ui/primitives'
import type { ChartColor } from '@/lib/expense-data'
import { SIGNUP_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

const SHEETS: { id: string; label: string; color?: ChartColor }[] = [
  { id: 'top', label: 'Overview' },
  { id: 'ledger', label: 'Ledger', color: 1 },
  { id: 'how', label: 'How it works', color: 2 },
  { id: 'math', label: 'The math', color: 3 },
  { id: 'features', label: 'Features', color: 4 },
]

/** The closing call to action, where the last tab takes over as the next step. */
const CTA_ID = 'start'

const tabBase =
  'flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-ring/60'

/**
 * The app's bottom sheet tabs (splitsheet-web components/sheet-tabs.tsx),
 * reused as section navigation so the page already reads as the product. It
 * floats as a compact dock rather than the app's full-width strip: a landing
 * page can't spare a permanent band over its content, and the "+ New trip"
 * tab, which signs up, has to stay on screen even on a phone.
 */
export function SheetTabs() {
  const [active, setActive] = useState(SHEETS[0].id)
  const [atCta, setAtCta] = useState(false)
  // Null until the first observation, so the server markup is never inert:
  // without scripts the dock simply stays visible.
  const [docked, setDocked] = useState<boolean | null>(null)

  useEffect(() => {
    // Only a browser too old to run this React build lacks an observer; the
    // guard keeps it from throwing, and the header and footer still reach the app.
    if (!('IntersectionObserver' in window)) return

    // A thin band across the middle of the viewport: whichever section is
    // crossing it is the sheet you are "on", with no ties between two sections.
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const { id } of SHEETS) {
      const el = document.getElementById(id)
      if (el) spy.observe(el)
    }

    const cta = new IntersectionObserver(([entry]) => setAtCta(entry.isIntersecting), {
      threshold: 0.4,
    })
    const ctaEl = document.getElementById(CTA_ID)
    if (ctaEl) cta.observe(ctaEl)

    // The hero has its own call to action and nothing to navigate from yet, so
    // the dock waits until the hero has mostly scrolled away.
    const hero = new IntersectionObserver(([entry]) => setDocked(!entry.isIntersecting), {
      rootMargin: '-40% 0px 0px 0px',
    })
    const heroEl = document.getElementById(SHEETS[0].id)
    if (heroEl) hero.observe(heroEl)

    return () => {
      spy.disconnect()
      cta.disconnect()
      hero.disconnect()
    }
  }, [])

  return (
    <nav
      aria-label="Sheets"
      data-sheet-dock
      data-shown={docked ? '' : undefined}
      // Keeps the hidden dock's links out of the tab order.
      inert={docked === false}
      // The bottom offset adds the iOS home-indicator inset; it needs
      // viewport-fit=cover (app/layout) to be non-zero at all.
      className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 rounded-xl border border-border bg-card/85 p-1 shadow-lg shadow-black/5 backdrop-blur-md transition-[opacity,transform] duration-300"
    >
      {/* Scrolls only as a last resort on the narrowest phones; the sign-up tab
          sits outside it so it can never be scrolled away. */}
      <div className="flex min-w-0 items-center gap-0.5 overflow-x-auto">
        {SHEETS.map((s) => {
          const on = !atCta && active === s.id
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={on ? 'true' : undefined}
              className={cn(
                tabBase,
                // On a phone only the current sheet has room for its label.
                on ? 'px-3' : 'max-sm:w-9 max-sm:justify-center sm:px-3',
                // The inset shadow is the spreadsheet's "current sheet" line,
                // drawn without changing the tab's height.
                on
                  ? 'bg-muted text-foreground shadow-[inset_0_-2px_0_0_var(--color-primary)]'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {s.color ? (
                <span className={cn('size-2 shrink-0 rounded-full', CHART_BG[s.color])} aria-hidden />
              ) : (
                <LayoutGrid className="size-3.5 shrink-0 text-primary" aria-hidden />
              )}
              <span className={on ? 'max-w-28 truncate sm:max-w-none' : 'max-sm:sr-only'}>{s.label}</span>
            </a>
          )
        })}
      </div>

      <span className="h-5 w-px shrink-0 bg-border" aria-hidden />

      <a
        href={SIGNUP_URL}
        aria-current={atCta ? 'true' : undefined}
        className={cn(
          tabBase,
          'border px-3 text-primary',
          atCta
            ? 'sheet-nudge border-primary/60 bg-primary/10'
            : 'border-dashed border-primary/40 hover:border-solid hover:bg-primary/10',
        )}
      >
        <Plus className="size-3.5" aria-hidden />
        New trip
      </a>
    </nav>
  )
}
