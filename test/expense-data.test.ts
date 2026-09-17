import { describe, expect, it } from 'vitest'
import {
  balanceDirection,
  computeBalances,
  computeSettlements,
  formatMoney,
  round2,
  shareOf,
  type Expense,
  type TripData,
} from '@/lib/expense-data'

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: 'e1',
    date: '2026-07-01',
    description: 'Test expense',
    category: 'Other',
    paidBy: 'a',
    amount: 0,
    participants: [],
    splitMode: 'equal',
    ...overrides,
  }
}

function trip(overrides: Partial<TripData>): TripData {
  return {
    name: 'Test trip',
    currency: '$',
    currencyCode: 'USD',
    people: [
      { id: 'a', name: 'Ana', color: 1 },
      { id: 'b', name: 'Ben', color: 2 },
      { id: 'c', name: 'Cam', color: 3 },
    ],
    expenses: [],
    charges: [],
    settlements: [],
    ...overrides,
  }
}

describe('shareOf', () => {
  it('splits equally between participants', () => {
    const e = expense({ amount: 90, participants: ['a', 'b', 'c'] })
    expect(shareOf(e, 'a')).toBe(30)
    expect(shareOf(e, 'b')).toBe(30)
  })

  it('returns 0 for a non-participant', () => {
    const e = expense({ amount: 90, participants: ['a', 'b'] })
    expect(shareOf(e, 'c')).toBe(0)
  })

  it('allocates the odd cent when the amount does not divide evenly', () => {
    const e = expense({ amount: 100, participants: ['a', 'b', 'c'] })
    expect(shareOf(e, 'a')).toBe(33.34)
    expect(shareOf(e, 'b')).toBe(33.33)
    expect(shareOf(e, 'c')).toBe(33.33)
  })

  it('equal shares sum to the total, matching the same split by weight', () => {
    const equal = expense({ amount: 100, participants: ['a', 'b', 'c'] })
    const weighted = expense({
      amount: 100,
      participants: ['a', 'b', 'c'],
      splitMode: 'shares',
      splits: { a: 1, b: 1, c: 1 },
    })
    const sum = (e: Expense) =>
      round2(shareOf(e, 'a') + shareOf(e, 'b') + shareOf(e, 'c'))
    expect(sum(equal)).toBe(100)
    expect(['a', 'b', 'c'].map((id) => shareOf(equal, id))).toEqual(
      ['a', 'b', 'c'].map((id) => shareOf(weighted, id)),
    )
  })

  it('returns 0 with no participants', () => {
    const e = expense({ amount: 90 })
    expect(shareOf(e, 'a')).toBe(0)
  })

  it('reads exact splits directly, defaulting missing members to 0', () => {
    const e = expense({
      amount: 100,
      participants: ['a', 'b'],
      splitMode: 'exact',
      splits: { a: 30 },
    })
    expect(shareOf(e, 'a')).toBe(30)
    expect(shareOf(e, 'b')).toBe(0)
  })
})

describe('weighted (shares) splits', () => {
  const sharesExpense = (
    amount: number,
    participants: string[],
    splits: Record<string, number>,
  ) => expense({ amount, participants, splitMode: 'shares', splits })

  it('sums to the exact total, extra cent to the lowest member id on ties', () => {
    const e = sharesExpense(100, ['a', 'b', 'c'], { a: 1, b: 1, c: 1 })
    // 10000 cents / 3 leaves one remainder cent; equal fractions tie-break
    // by member id ascending, so 'a' absorbs it.
    expect(shareOf(e, 'a')).toBe(33.34)
    expect(shareOf(e, 'b')).toBe(33.33)
    expect(shareOf(e, 'c')).toBe(33.33)
    expect(round2(shareOf(e, 'a') + shareOf(e, 'b') + shareOf(e, 'c'))).toBe(100)
  })

  it('allocates by weight with largest-remainder rounding', () => {
    const e = sharesExpense(10, ['a', 'b', 'c'], { a: 1, b: 2, c: 3 })
    // Raw cents: a 166.67, b 333.33, c 500 — a has the largest fraction.
    expect(shareOf(e, 'a')).toBe(1.67)
    expect(shareOf(e, 'b')).toBe(3.33)
    expect(shareOf(e, 'c')).toBe(5)
  })

  it('gives the single cent of a tiny amount to one member', () => {
    const e = sharesExpense(0.01, ['a', 'b', 'c'], { a: 1, b: 1, c: 1 })
    expect(shareOf(e, 'a')).toBe(0.01)
    expect(shareOf(e, 'b')).toBe(0)
    expect(shareOf(e, 'c')).toBe(0)
  })

  it('returns all zeros when the total weight is 0', () => {
    const e = sharesExpense(50, ['a', 'b'], {})
    expect(shareOf(e, 'a')).toBe(0)
    expect(shareOf(e, 'b')).toBe(0)
  })

  it('gives nothing to participants with weight 0', () => {
    const e = sharesExpense(50, ['a', 'b', 'c'], { a: 1, b: 1 })
    expect(shareOf(e, 'a')).toBe(25)
    expect(shareOf(e, 'b')).toBe(25)
    expect(shareOf(e, 'c')).toBe(0)
  })
})

describe('computeBalances', () => {
  it('credits the payer and debits participants', () => {
    const data = trip({
      expenses: [expense({ amount: 90, paidBy: 'a', participants: ['a', 'b', 'c'] })],
    })
    expect(computeBalances(data)).toEqual({ a: 60, b: -30, c: -30 })
  })

  it('credits a payer who is not a participant with the full amount', () => {
    const data = trip({
      expenses: [expense({ amount: 50, paidBy: 'a', participants: ['b', 'c'] })],
    })
    expect(computeBalances(data)).toEqual({ a: 50, b: -25, c: -25 })
  })

  it('applies charges (from owes to) and recorded settlements (from paid to)', () => {
    const data = trip({
      expenses: [expense({ amount: 90, paidBy: 'a', participants: ['a', 'b', 'c'] })],
      charges: [{ id: 'c1', from: 'b', to: 'a', description: 'IOU', amount: 10 }],
      settlements: [
        { id: 's1', from: 'b', to: 'a', date: '2026-07-02', note: '', amount: 40 },
      ],
    })
    expect(computeBalances(data)).toEqual({ a: 30, b: 0, c: -30 })
  })

  it('ignores ids that are not trip members', () => {
    const data = trip({
      expenses: [expense({ amount: 50, paidBy: 'ghost', participants: ['ghost', 'a'] })],
      charges: [{ id: 'c1', from: 'ghost', to: 'ghost2', description: '', amount: 5 }],
    })
    const bal = computeBalances(data)
    expect(Object.keys(bal).sort()).toEqual(['a', 'b', 'c'])
    expect(bal.a).toBe(-25)
  })

  it('balances sum to zero when the payer participates', () => {
    const data = trip({
      expenses: [
        expense({ id: 'e1', amount: 99.99, paidBy: 'a', participants: ['a', 'b', 'c'] }),
        expense({
          id: 'e2',
          amount: 45.5,
          paidBy: 'b',
          participants: ['a', 'b', 'c'],
          splitMode: 'shares',
          splits: { a: 2, b: 1, c: 1 },
        }),
      ],
    })
    const bal = computeBalances(data)
    const sum = Object.values(bal).reduce((s, v) => s + v, 0)
    expect(Math.abs(sum)).toBeLessThan(0.005)
  })
})

describe('computeSettlements', () => {
  const people = [
    { id: 'a', name: 'Ana', color: 1 as const },
    { id: 'b', name: 'Ben', color: 2 as const },
    { id: 'c', name: 'Cam', color: 3 as const },
    { id: 'd', name: 'Dee', color: 4 as const },
  ]

  it('settles a two-person trip with one transfer', () => {
    const data = trip({
      people: people.slice(0, 2),
      expenses: [expense({ amount: 50, paidBy: 'a', participants: ['a', 'b'] })],
    })
    expect(computeSettlements(data)).toEqual([{ from: 'b', to: 'a', amount: 25 }])
  })

  it('routes multiple debtors to creditors greedily, largest first', () => {
    const data = trip({ people })
    const transfers = computeSettlements(data, { a: 40, b: 10, c: -30, d: -20 })
    expect(transfers).toEqual([
      { from: 'c', to: 'a', amount: 30 },
      { from: 'd', to: 'a', amount: 10 },
      { from: 'd', to: 'b', amount: 10 },
    ])
  })

  it('suggests nothing when balances are within the epsilon', () => {
    const data = trip({ people })
    expect(computeSettlements(data, { a: 0.004, b: -0.004, c: 0, d: 0 })).toEqual([])
  })

  it('transfers exactly cover the positive balances', () => {
    const data = trip({ people })
    const balances = { a: 62.13, b: -20.71, c: -41.42, d: 0 }
    const transfers = computeSettlements(data, balances)
    const total = transfers.reduce((s, t) => s + t.amount, 0)
    expect(round2(total)).toBe(62.13)
    for (const t of transfers) expect(t.amount).toBe(round2(t.amount))
  })
})

describe('round2 and balanceDirection', () => {
  it('rounds half-cents up despite float representation', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(10.994999)).toBe(10.99)
    expect(round2(-2.5)).toBe(-2.5)
  })

  it('rounds half-cents away from zero on both signs', () => {
    expect(round2(-1.005)).toBe(-1.01)
    expect(round2(2.675)).toBe(2.68)
    expect(round2(-2.675)).toBe(-2.68)
  })

  it('does not produce a negative zero', () => {
    // -0 formats as "-$0.00", which reads as a debt that isn't there.
    expect(Object.is(round2(-0.001), 0)).toBe(true)
  })

  it('treats balances within ±0.005 as even', () => {
    expect(balanceDirection(0.005)).toBe('even')
    expect(balanceDirection(-0.005)).toBe('even')
    expect(balanceDirection(0.0051)).toBe('up')
    expect(balanceDirection(-0.0051)).toBe('down')
  })
})

describe('formatMoney', () => {
  it('formats USD with two decimals and grouping', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50')
    expect(formatMoney(0, 'USD')).toBe('$0.00')
  })

  it('defaults to USD when no code is given', () => {
    expect(formatMoney(12)).toBe('$12.00')
  })

  it('signs negative amounts', () => {
    expect(formatMoney(-42.1, 'USD')).toBe('-$42.10')
  })

  it('renders zero-decimal currencies without fraction digits', () => {
    expect(formatMoney(1500, 'JPY')).toBe('¥1,500')
    expect(formatMoney(9800.4, 'KRW')).toBe('₩9,800')
  })

  it('disambiguates shared symbols by code', () => {
    expect(formatMoney(10, 'CAD')).toBe('CA$10.00')
    expect(formatMoney(10, 'MXN')).toBe('MX$10.00')
  })

  it('falls back to USD on an unknown currency code', () => {
    expect(formatMoney(5, 'NOPE')).toBe('$5.00')
  })
})
