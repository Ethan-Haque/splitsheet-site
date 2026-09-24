import { ArrowRight } from 'lucide-react'
import { Avatar, Container, SectionHeading } from '@/components/ui/primitives'
import { DEMO_SEED, GREEDY_CASE, GREEDY_OPTIMAL, splitAnatomy } from '@/lib/demo'
import { computeSettlements, formatMoney, personById } from '@/lib/expense-data'
import { cn } from '@/lib/utils'

// Everything on this section is computed at build time by the vendored math,
// so the static HTML ships numbers the app itself produced.

const taxi = DEMO_SEED.expenses.find((e) => e.splitMode === 'shares')!
const rows = splitAnatomy(taxi)

const greedy = computeSettlements(GREEDY_CASE)

export function SplitAnatomy() {
  return (
    <section id="math" aria-labelledby="math-title" className="border-y border-border bg-card/50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="The math"
          title={<span id="math-title">Anatomy of a split: where does the odd cent go?</span>}
        >
          Split $100 three ways and a naive app shows $33.33 × 3, which is $99.99. Somebody has to
          carry the extra cent, and every phone in the group has to agree on who.
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          <figure className="overflow-hidden rounded-2xl border border-border bg-card" data-reveal>
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-4">
              <span className="font-semibold">{taxi.description}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {formatMoney(taxi.amount)} · shares{' '}
                {rows.map((r) => r.weight).join(' : ')}
              </span>
            </figcaption>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[30rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="px-5 py-2.5 font-medium">Person</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Exact ¢</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Floor</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Leftover</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">Charged</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums">
                  {rows.map((r) => {
                    const p = personById(DEMO_SEED, r.personId)!
                    return (
                      <tr key={r.personId} className={cn('border-b border-border last:border-0', r.bonusCents && 'bg-accent/50')}>
                        <th scope="row" className="px-5 py-3 text-left font-sans font-medium">
                          <span className="flex items-center gap-2">
                            <Avatar person={p} size="sm" />
                            {p.name}
                            <span className="font-mono text-xs font-normal text-muted-foreground">×{r.weight}</span>
                          </span>
                        </th>
                        <td className="px-3 py-3 text-right text-muted-foreground">{r.exactCents.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right">{r.flooredCents}</td>
                        <td className={cn('px-3 py-3 text-right', r.bonusCents ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                          {r.bonusCents ? '+1' : '0'}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold">{formatMoney(r.share)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30 font-mono tabular-nums">
                    <th scope="row" className="px-5 py-3 text-left font-sans font-medium">Total</th>
                    <td className="px-3 py-3 text-right text-muted-foreground">
                      {rows.reduce((s, r) => s + r.exactCents, 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right">{rows.reduce((s, r) => s + r.flooredCents, 0)}</td>
                    <td className="px-3 py-3 text-right">+{rows.reduce((s, r) => s + r.bonusCents, 0)}</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {formatMoney(rows.reduce((s, r) => s + r.share, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </figure>

          <ol className="space-y-5 text-sm leading-relaxed" data-reveal>
            <Step n={1} title="Work in whole cents">
              {`${formatMoney(taxi.amount)} becomes ${Math.round(taxi.amount * 100)} cents. Each person’s exact share of that, by weight, is almost never a whole number.`}
            </Step>
            <Step n={2} title="Round everyone down">
              Flooring every share guarantees nobody is overcharged, and leaves a few cents unassigned.
              Here, {rows.reduce((s, r) => s + r.bonusCents, 0)}.
            </Step>
            <Step n={3} title="Hand out the leftovers by largest remainder">
              The people who lost the most to rounding get one cent each. Ties go to the lowest member
              id, so every device lands on the same cent.
            </Step>
          </ol>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-start">
          <div data-reveal>
            <h3 className="text-xl font-semibold tracking-tight">Settling up: fast, and honest about it</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Finding the fewest possible payments is NP-hard: it reduces to subset-sum. Splitsheet pays
              the largest debtor into the largest creditor, repeatedly. It runs in O(n log n), never needs
              more than n − 1 payments, and is occasionally one above optimal. This is the case the
              source&apos;s own doc comment calls out.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2" data-reveal>
            <PlanCard title="Greedy plan (what ships)" count={greedy.length} transfers={greedy} />
            <PlanCard title="Optimal plan" count={GREEDY_OPTIMAL.length} transfers={GREEDY_OPTIMAL} muted />
          </div>
        </div>
      </Container>
    </section>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
        {n}
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-muted-foreground">{children}</p>
      </div>
    </li>
  )
}

function PlanCard({
  title,
  count,
  transfers,
  muted = false,
}: {
  title: string
  count: number
  transfers: { from: string; to: string; amount: number }[]
  muted?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
        <span className={cn('rounded-full px-1.5 py-px font-mono normal-case', muted ? 'bg-muted' : 'bg-accent text-accent-foreground')}>
          {count} payments
        </span>
      </p>
      <ul className="mt-3 space-y-1.5">
        {transfers.map((t) => {
          const from = personById(GREEDY_CASE, t.from)!
          const to = personById(GREEDY_CASE, t.to)!
          return (
            <li key={`${t.from}-${t.to}`} className="flex items-center gap-2 text-sm">
              <Avatar person={from} size="sm" />
              <span className="flex min-w-0 flex-1 items-center gap-1">
                {from.name}
                <ArrowRight className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">pays</span>
                {to.name}
              </span>
              <span className="font-mono tabular-nums">{formatMoney(t.amount)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
