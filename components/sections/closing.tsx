import { ArrowUpRight } from 'lucide-react'
import { GitHubMark } from '@/components/ui/github-mark'
import { Container, Logo } from '@/components/ui/primitives'
import { NAV_LINKS } from '@/components/sections/nav'
import { APP_URL, AUTHOR, REPOS, SIGNUP_URL } from '@/lib/site'

const STEPS = ['Create a trip', 'Share the link with the group', 'Settle up in a few payments']

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
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="font-mono text-xs font-medium tracking-widest text-cta-foreground/75 uppercase">
                Ready when your group is
              </p>
              <h2 id="cta-title" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Your next trip, already split.
              </h2>
              <p className="mt-4 max-w-md text-cta-foreground/85">
                Free to use. Create an account, start a trip, and send the link to the group chat.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SIGNUP_URL}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-background px-5 font-medium text-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cta-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-cta [&_svg]:size-4"
                >
                  Create your trip
                  <ArrowUpRight aria-hidden />
                </a>
                <a
                  href={REPOS.web.url}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-cta-foreground/40 px-5 font-medium outline-none transition-colors hover:bg-cta-foreground/10 focus-visible:ring-2 focus-visible:ring-cta-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-cta"
                >
                  <GitHubMark className="size-4" />
                  Read the source
                </a>
              </div>
            </div>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-xl border border-cta-foreground/15 bg-cta-foreground/10 px-4 py-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cta-foreground font-mono text-sm font-semibold text-cta">
                    {i + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>
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
      links: [{ href: APP_URL, label: 'Open the app' }, ...NAV_LINKS],
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
      <Container className="flex flex-wrap justify-between gap-2 border-t border-border pt-6 pb-24 text-xs text-muted-foreground">
        <p>© 2026 {AUTHOR.name}. MIT licensed.</p>
        <p>Built with Next.js, statically exported.</p>
      </Container>
    </footer>
  )
}
