import { ArrowUpRight } from 'lucide-react'
import { GitHubMark } from '@/components/ui/github-mark'
import { Container, Logo, buttonClass } from '@/components/ui/primitives'
import { APP_URL, REPOS } from '@/lib/site'

export const NAV_LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#math', label: 'The math' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-6">
        <a href="#top" aria-label="Splitsheet, back to top">
          <Logo />
        </a>
        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex gap-1 text-sm text-muted-foreground">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a href={REPOS.web.url} className={buttonClass('ghost')} aria-label="Source code on GitHub">
            <GitHubMark className="size-4" />
            <span className="hidden sm:inline">Source</span>
          </a>
          <a href={APP_URL} className={buttonClass('primary')}>
            Open the app
            <ArrowUpRight aria-hidden />
          </a>
        </div>
      </Container>
    </header>
  )
}
