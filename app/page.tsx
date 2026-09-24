import { Hero } from '@/components/sections/hero'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Nav } from '@/components/sections/nav'
import { Showcase } from '@/components/sections/showcase'
import { SplitAnatomy } from '@/components/sections/split-anatomy'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Showcase />
        <HowItWorks />
        <SplitAnatomy />
      </main>
    </>
  )
}
