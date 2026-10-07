import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { LiveSplitter } from '@/components/demo/live-splitter'
import { Container, buttonClass } from '@/components/ui/primitives'
import { APP_URL } from '@/lib/site'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
        aria-hidden
      />
      <Container className="grid grid-cols-1 items-start gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-14 lg:pt-24">
        <div className="lg:pt-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Every trip expense, in one shared sheet.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Log who paid and split it evenly, by shares, by percentage, or to the exact cent. Everyone
            sees the same live balances, and when the trip ends Splitsheet works out who pays whom in
            as few payments as it can.
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
