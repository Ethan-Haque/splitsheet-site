import Image from 'next/image'
import { HandCoins, Link2, Plane, Radio, Upload } from 'lucide-react'
import { BrowserFrame, Container, SectionHeading } from '@/components/ui/primitives'

const STEPS = [
  {
    icon: Plane,
    title: 'Start a trip',
    body: 'Name it, set the dates and currency, and optionally a budget. Add people by name; they do not need an account yet.',
  },
  {
    icon: Link2,
    title: 'Invite the group',
    body: 'Send a join link. Someone added by name can claim their spot later, and every expense already logged against them comes along.',
  },
  {
    icon: Upload,
    title: 'Log as you go, or import',
    body: 'Add expenses from the ledger, attach a receipt photo, or drop in a card statement CSV. Categories are guessed and duplicates flagged before anything is added.',
  },
  {
    icon: Radio,
    title: 'Balances update live',
    body: 'Edits show up for everyone viewing the trip right away, with avatars for who else has it open.',
  },
  {
    icon: HandCoins,
    title: 'Settle up',
    body: 'Splitsheet proposes the fewest payments it can find to clear everyone. Mark each one paid as money changes hands, until everyone is squared up.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-title">From the first expense to settling up.</span>}
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
          <ol className="relative space-y-8">
            {/* Timeline rail behind the step numbers. */}
            <span className="absolute top-2 bottom-2 left-[19px] w-px bg-border" aria-hidden />
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-5" data-reveal>
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <step.icon className="size-4 text-primary" aria-hidden />
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lg:sticky lg:top-24 lg:self-start" data-reveal>
            <BrowserFrame url="trip.ethanhaque.ca/trips/amalfi-coast">
              <Image
                src="/screenshots/settle-up.webp"
                width={1600}
                height={1000}
                alt="The trip overview below the ledger: a balance card per traveler, spending by category, and the settle-up plan listing three payments, each with a Mark paid button."
                className="h-auto w-full"
              />
            </BrowserFrame>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Step 5 in the app: balances, insights, and the settle-up plan.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
