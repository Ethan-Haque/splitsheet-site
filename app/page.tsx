import { Hero } from '@/components/sections/hero'
import { Nav } from '@/components/sections/nav'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
      </main>
    </>
  )
}
