import { ImageResponse } from 'next/og'
import { DEMO_SEED } from '@/lib/demo'
import { computeSettlements, formatMoney, personById } from '@/lib/expense-data'

export const dynamic = 'force-static'
export const alt = 'Splitsheet: every trip expense, in one shared sheet.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const COLORS = { 1: '#0f766e', 2: '#2563eb', 3: '#c2410c', 4: '#7c3aed', 5: '#db2777' } as const

/** The share card: headline on the left, the demo trip's settle-up plan on the right. */
export default function OpengraphImage() {
  const transfers = computeSettlements(DEMO_SEED)
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          padding: 80,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 34, fontWeight: 600 }}>
            <LogoMark />
            Splitsheet
          </div>
          <div style={{ marginTop: 40, fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
            Every trip expense, in one shared sheet.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: '#a1a1aa' }}>
            Live balances. Settle up in as few payments as it can.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: 420,
            padding: 28,
            borderRadius: 24,
            background: '#18181b',
            border: '1px solid #27272a',
          }}
        >
          <div style={{ fontSize: 20, color: '#a1a1aa', letterSpacing: 2 }}>SETTLE UP</div>
          {transfers.map((t) => {
            const from = personById(DEMO_SEED, t.from)!
            const to = personById(DEMO_SEED, t.to)!
            return (
              <div key={t.from} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28 }}>
                <Dot color={COLORS[from.color]} letter={from.name[0]} />
                <span style={{ color: '#71717a' }}>→</span>
                <Dot color={COLORS[to.color]} letter={to.name[0]} />
                <span style={{ flex: 1 }} />
                <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatMoney(t.amount)}</span>
              </div>
            )
          })}
        </div>
      </div>
    ),
    size,
  )
}

function Dot({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 700,
        color: 'white',
      }}
    >
      {letter}
    </div>
  )
}

/** app/icon.svg redrawn in boxes: Satori has no inline <svg> children. */
function LogoMark() {
  const line = '3px solid white'
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        background: '#15803d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 30, height: 30, border: line, borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 8, borderBottom: line, display: 'flex' }} />
        <div style={{ width: 8, flex: 1, borderRight: line, display: 'flex' }} />
      </div>
    </div>
  )
}
