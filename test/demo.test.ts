import { describe, expect, it } from 'vitest'
import {
  computeBalances,
  computeSettlements,
  formatMoney,
  type Expense,
  type TripData,
} from '@/lib/expense-data'
import {
  DEMO_SEED,
  GREEDY_CASE,
  GREEDY_OPTIMAL,
  MAX_EXPENSES,
  MAX_WEIGHT,
  demoReducer,
  splitAnatomy,
  type DemoAction,
} from '@/lib/demo'

function run(...actions: DemoAction[]): TripData {
  return actions.reduce(demoReducer, DEMO_SEED)
}

function byId(data: TripData, id: string): Expense {
  const e = data.expenses.find((x) => x.id === id)
  if (!e) throw new Error(`no expense ${id}`)
  return e
}

function signed(n: number): string {
  return `${n > 0 ? '+' : n < 0 ? '-' : ''}${formatMoney(Math.abs(n))}`
}

describe('demo seed', () => {
  // The same expectations splitsheet-web's e2e/smoke.spec.ts asserts against
  // the deployed app, with its "Smoke Owner" renamed to Ava.
  it('matches the production smoke test balances', () => {
    const b = computeBalances(DEMO_SEED)
    expect({ Ava: signed(b.p1), Blake: signed(b.p2), Casey: signed(b.p3) }).toEqual({
      Ava: '+$119.99',
      Blake: '-$65.00',
      Casey: '-$54.99',
    })
  })

  it('matches the production smoke test settle-up plan', () => {
    expect(computeSettlements(DEMO_SEED)).toEqual([
      { from: 'p2', to: 'p1', amount: 65 },
      { from: 'p3', to: 'p1', amount: 54.99 },
    ])
  })
})

describe('demoReducer', () => {
  it('keeps amounts in whole, non-negative cents', () => {
    expect(byId(run({ type: 'setAmount', id: 'e1', amount: 12.345 }), 'e1').amount).toBe(12.35)
    expect(byId(run({ type: 'setAmount', id: 'e1', amount: -4 }), 'e1').amount).toBe(0)
    expect(byId(run({ type: 'setAmount', id: 'e1', amount: Number.NaN }), 'e1').amount).toBe(300)
  })

  it('never removes the last participant', () => {
    const data = run(
      { type: 'toggleParticipant', id: 'e1', personId: 'p1' },
      { type: 'toggleParticipant', id: 'e1', personId: 'p2' },
      { type: 'toggleParticipant', id: 'e1', personId: 'p3' },
    )
    expect(byId(data, 'e1').participants).toEqual(['p3'])
  })

  it('re-adds a participant in member order', () => {
    const data = run(
      { type: 'toggleParticipant', id: 'e1', personId: 'p1' },
      { type: 'toggleParticipant', id: 'e1', personId: 'p1' },
    )
    expect(byId(data, 'e1').participants).toEqual(['p1', 'p2', 'p3'])
  })

  it('keeps share weights in step with participants', () => {
    const dropped = run({ type: 'toggleParticipant', id: 'e3', personId: 'p2' })
    expect(byId(dropped, 'e3').splits).toEqual({ p1: 2, p3: 1 })

    const back = demoReducer(dropped, { type: 'toggleParticipant', id: 'e3', personId: 'p2' })
    expect(byId(back, 'e3').splits).toEqual({ p1: 2, p2: 1, p3: 1 })
  })

  it('switches modes, seeding weight 1 on the way to shares', () => {
    const equal = run({ type: 'setMode', id: 'e3', mode: 'equal' })
    expect(byId(equal, 'e3')).toMatchObject({ splitMode: 'equal', splits: undefined })

    const shares = demoReducer(equal, { type: 'setMode', id: 'e3', mode: 'shares' })
    expect(byId(shares, 'e3').splits).toEqual({ p1: 1, p2: 1, p3: 1 })
  })

  it('clamps weights and ignores them outside a shares split', () => {
    expect(byId(run({ type: 'setWeight', id: 'e3', personId: 'p2', weight: 40 }), 'e3').splits?.p2).toBe(MAX_WEIGHT)
    expect(byId(run({ type: 'setWeight', id: 'e3', personId: 'p2', weight: 0 }), 'e3').splits?.p2).toBe(1)
    const equal = run({ type: 'setWeight', id: 'e1', personId: 'p2', weight: 3 })
    expect(byId(equal, 'e1')).toBe(byId(DEMO_SEED, 'e1'))
  })

  it('adds each extra once, up to the cap', () => {
    const full = run({ type: 'add' }, { type: 'add' }, { type: 'add' }, { type: 'add' })
    expect(full.expenses).toHaveLength(MAX_EXPENSES)
    expect(new Set(full.expenses.map((e) => e.description)).size).toBe(MAX_EXPENSES)
    expect(new Set(full.expenses.map((e) => e.id)).size).toBe(MAX_EXPENSES)
  })

  it('does not duplicate an extra after remove and re-add', () => {
    const data = run({ type: 'add' }, { type: 'remove', id: 'e1' }, { type: 'add' })
    const descriptions = data.expenses.map((e) => e.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
    expect(new Set(data.expenses.map((e) => e.id)).size).toBe(data.expenses.length)
  })

  it('resets to the seed', () => {
    expect(run({ type: 'remove', id: 'e1' }, { type: 'reset' })).toBe(DEMO_SEED)
  })

  it('always balances to zero', () => {
    const data = run(
      { type: 'add' },
      { type: 'setAmount', id: 'e4', amount: 10 },
      { type: 'setMode', id: 'e4', mode: 'shares' },
      { type: 'setWeight', id: 'e4', personId: 'p1', weight: 7 },
      { type: 'setPaidBy', id: 'e2', personId: 'p3' },
    )
    const total = Object.values(computeBalances(data)).reduce((s, v) => s + v, 0)
    expect(Math.abs(total)).toBeLessThan(1e-9)
  })
})

describe('splitAnatomy', () => {
  it('walks the smoke-test taxi: the odd cent goes to the largest remainder', () => {
    expect(splitAnatomy(byId(DEMO_SEED, 'e3'))).toEqual([
      { personId: 'p1', weight: 2, exactCents: 5000.5, flooredCents: 5000, bonusCents: 1, share: 50.01 },
      { personId: 'p2', weight: 1, exactCents: 2500.25, flooredCents: 2500, bonusCents: 0, share: 25 },
      { personId: 'p3', weight: 1, exactCents: 2500.25, flooredCents: 2500, bonusCents: 0, share: 25 },
    ])
  })

  it('breaks equal remainders by lowest member id', () => {
    const rows = splitAnatomy({ ...byId(DEMO_SEED, 'e1'), amount: 100 })
    expect(rows.map((r) => r.bonusCents)).toEqual([1, 0, 0])
  })

  // The walkthrough re-derives the allocator's steps; this is what stops the
  // explanation from drifting away from the vendored shareOf.
  it('agrees with shareOf on every amount and weighting it can be shown', () => {
    const base = byId(DEMO_SEED, 'e3')
    for (let cents = 0; cents <= 2000; cents += 7) {
      for (const splits of [{ p1: 1, p2: 1, p3: 1 }, { p1: 2, p2: 1, p3: 1 }, { p1: 3, p2: 5, p3: 9 }]) {
        const rows = splitAnatomy({ ...base, amount: cents / 100, splits })
        for (const r of rows) {
          expect((r.flooredCents + r.bonusCents) / 100).toBeCloseTo(r.share, 10)
        }
        expect(rows.reduce((s, r) => s + r.flooredCents + r.bonusCents, 0)).toBe(cents)
      }
    }
  })
})

describe('greedy settle-up counterexample', () => {
  it('has the nets the source comment describes', () => {
    expect(Object.values(computeBalances(GREEDY_CASE))).toEqual([4, 3, -1, -3, -3])
  })

  it('takes the greedy plan four payments', () => {
    expect(computeSettlements(GREEDY_CASE)).toHaveLength(4)
  })

  it('is cleared by the three-payment plan shown beside it', () => {
    const settled = computeBalances({
      ...GREEDY_CASE,
      settlements: GREEDY_OPTIMAL.map((t, i) => ({ ...t, id: `s${i}`, date: '2026-06-12', note: '' })),
    })
    expect(Object.values(settled).every((v) => Math.abs(v) < 1e-9)).toBe(true)
  })
})
