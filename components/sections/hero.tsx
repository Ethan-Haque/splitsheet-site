import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { LiveSplitter } from '@/components/demo/live-splitter'
import { Container, buttonClass } from '@/components/ui/primitives'
import { APP_TEST_COUNT, APP_URL } from '@/lib/site'

const STATS = [
  { value: String(APP_TEST_COUNT), label: 'unit tests on the app' },
  { value: '0', label: 'balances stored on the server' },
  { value: 'n − 1', label: 'payments at most to settle' },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        aria-hidden
      />
      <Container className="grid grid-cols-1 items-start gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-14 lg:pt-24">
        <div className="lg:pt-6">
         

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Every trip expense, in one shared sheet.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Log who paid, split it evenly, by shares, by percentage, or to the exact
            cent, and everyone sees a live
            balance. When the trip ends, Splitsheet tells the group who pays whom, in as few payments as
            it can.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={APP_URL} className={buttonClass('primary', 'lg')}>
              Open the app
              <ArrowUpRight aria-hidden />
            </a>
            <a href="#how" className={buttonClass('outline', 'lg')}>
              See how it works
              <ArrowDown aria-hidden />
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <LiveSplitter />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Try it: switch the taxi to <span className="font-medium text-foreground">Equal</span>, or
            take Casey off the hotel.
          </p>
        </div>
      </Container>
    </section>
  )
}
