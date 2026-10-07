import { ArrowUpRight } from 'lucide-react'
import { GitHubMark } from '@/components/ui/github-mark'
import { Container, Logo, buttonClass } from '@/components/ui/primitives'
import { APP_URL, REPOS } from '@/lib/site'

// Section links live only in the sheet-tabs dock, so the header stays to the
// brand and the two ways out.
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-6">
        <a href="#top" aria-label="Splitsheet, back to top">
          <Logo />
        </a>
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
