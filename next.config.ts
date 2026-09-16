import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Plain HTML/CSS/JS in out/: no server to run, so it can sit on any static
  // host or behind nginx (see Dockerfile). docs/adr/0001 has the reasoning.
  output: 'export',
  images: {
    // The image optimizer needs a server; the screenshots are pre-sized WebP.
    unoptimized: true,
  },
}

export default nextConfig
