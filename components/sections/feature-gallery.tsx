import Image from 'next/image'
import { ChartPie, Download, Link2, Moon, PiggyBank, Radio, Receipt, Upload } from 'lucide-react'
import { Container, SectionHeading } from '@/components/ui/primitives'

const FEATURES = [
  {
    icon: PiggyBank,
    title: 'Budgets with a pace read',
    body: 'An overall target and per-category caps, measured against the trip dates: on track, ahead of pace, or over.',
  },
  {
    icon: Receipt,
    title: 'Receipt photos',
    body: 'Attach a photo to any row. A thumbnail sits in the ledger; click for the full-size lightbox.',
  },
  {
    icon: Upload,
    title: 'Card statement import',
    body: 'Map a bank CSV’s columns, review the guessed categories, and skip rows the trip already has.',
  },
  {
    icon: Radio,
    title: 'Live presence',
    body: 'A server-sent event stream pushes every edit to everyone viewing the trip, and shows who else is there.',
  },
  {
    icon: ChartPie,
    title: 'Insights',
    body: 'Spending by category and paid-versus-share per person, from the same numbers as the balances.',
  },
  {
    icon: Link2,
    title: 'Invite links',
    body: 'Share a join link, add friends by email, or hand a placeholder member’s history to a real account.',
  },
  {
    icon: Download,
    title: 'CSV export',
    body: 'Download the ledger or the settle-up plan for whoever insists on keeping their own spreadsheet.',
  },
  {
    icon: Moon,
    title: 'Light and dark',
    body: 'Applied before first paint, so the page never flashes the wrong theme on load.',
  },
]

export function FeatureGallery() {
  return (
    <section id="features" aria-labelledby="features-title" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Everything else"
          title={<span id="features-title">The details a group trip actually needs.</span>}
        />

        {/* Bento: the dashboard takes a 2×2 block and the eight features fill
            the cells around it, so four columns come out as three even rows. */}
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li className="sm:col-span-2 lg:row-span-2" data-reveal>
            <figure className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <Image
                src="/screenshots/dashboard.webp"
                width={1600}
                height={1000}
                alt="The trips dashboard in light mode: what you are owed and owe across every trip, trip cards for Amalfi Coast and Kyoto in Spring, a friends panel, and recent activity."
                className="h-auto w-full border-b border-border"
              />
              <figcaption className="mt-auto p-5">
                <p className="font-semibold">Every trip at a glance</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your net position across all trips, filtered by upcoming, active, or settled.
                </p>
              </figcaption>
            </figure>
          </li>

          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-2xl border border-border bg-card p-5" data-reveal>
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="size-[18px]" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
