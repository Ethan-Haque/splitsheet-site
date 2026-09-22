import Image from 'next/image'
import { BrowserFrame, Container, SectionHeading } from '@/components/ui/primitives'

const CALLOUTS = [
  {
    title: 'One row per expense',
    body: 'Date, category, who paid, and an avatar stack for who it covers. It reads like the spreadsheet your group would have made anyway.',
  },
  {
    title: 'A tab for each person',
    body: 'Every traveler gets a sheet of their own, with their share of each row and a running balance pinned to the tab bar.',
  },
  {
    title: 'Totals that add up',
    body: 'Shares are allocated in whole cents, so $100 three ways is $33.34 + $33.33 + $33.33, never a cent short.',
  },
]

export function Showcase() {
  return (
    <section id="ledger" aria-labelledby="showcase-title" className="border-y border-border bg-card/50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="The ledger"
          title={<span id="showcase-title">A spreadsheet that does the arithmetic for you.</span>}
        >
          The trip is the sheet. Add a row, pick who it covers, and every balance on every screen
          updates, including on your friends&apos; phones.
        </SectionHeading>

        <div className="mt-12" data-reveal>
          <BrowserFrame url="trip.ethanhaque.ca/trips/amalfi-coast">
            <Image
              src="/screenshots/ledger.webp"
              width={1600}
              height={1000}
              alt="The Amalfi Coast trip ledger: twelve expenses from an airport transfer to a farewell dinner, each with category, payer, the people it is split between, and the amount, totalling €5,336.75."
              className="h-auto w-full"
              priority
            />
          </BrowserFrame>
        </div>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {CALLOUTS.map((c, i) => (
            <li key={c.title} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
