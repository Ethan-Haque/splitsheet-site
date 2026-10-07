import { ArrowUpRight } from 'lucide-react'
import { Container, Logo } from '@/components/ui/primitives'
import { APP_URL, AUTHOR, REPOS, SIGNUP_URL } from '@/lib/site'

export function FinalCta() {
  return (
    <section id="start" aria-labelledby="cta-title" className="border-t border-border bg-card/50 pt-20 pb-6 sm:pt-28 sm:pb-10">
      <Container>
        <div
          className="relative overflow-hidden rounded-3xl bg-cta px-6 py-12 text-cta-foreground sm:px-10 sm:py-16 lg:px-14"
          data-reveal
        >
          <div
            className="bg-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_60%)]"
            aria-hidden
          />
          <div className="relative">
            <h2 id="cta-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Start your next trip.
            </h2>
            <p className="mt-4 max-w-md text-cta-foreground/85">
              Free to use. Create an account, start a trip, and send the link to the group.
            </p>
            <a
              href={SIGNUP_URL}
              className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-background px-5 font-medium text-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cta-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-cta [&_svg]:size-4"
            >
              Create your trip
              <ArrowUpRight aria-hidden />
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Footer() {
  const columns = [
    {
      title: 'Product',
      links: [
        { href: APP_URL, label: 'Open the app' },
        { href: SIGNUP_URL, label: 'Create an account' },
      ],
    },
    {
      title: 'Source',
      links: [REPOS.web, REPOS.api, REPOS.site].map((r) => ({ href: r.url, label: r.name })),
    },
    {
      title: 'Author',
      links: [
        { href: AUTHOR.portfolio, label: 'Portfolio' },
        { href: AUTHOR.github, label: 'GitHub' },
        { href: AUTHOR.linkedin, label: 'LinkedIn' },
      ],
    },
  ]

  return (
    <footer className="bg-card/50">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Split trip expenses in one shared sheet. Settle up in as few payments as it can find.
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-foreground hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      {/* The extra bottom padding keeps the copyright line clear of the fixed sheet tabs. */}
      <Container className="border-t border-border pt-6 pb-24 text-xs text-muted-foreground">
        <p>© 2026 {AUTHOR.name}. MIT licensed.</p>
      </Container>
    </footer>
  )
}
