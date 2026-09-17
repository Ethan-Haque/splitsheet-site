import { describe, expect, it } from 'vitest'
import { categoryBreakdown, personBreakdown } from '@/lib/insights'
import { computeBalances, round2, type Expense, type TripData } from '@/lib/expense-data'

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: 'e1',
    date: '2026-07-01',
    description: 'Test',
    category: 'Other',
    paidBy: 'a',
    amount: 0,
    participants: [],
    splitMode: 'equal',
    ...overrides,
  }
}

const base: TripData = {
  name: 'Trip',
  currency: '$',
  currencyCode: 'USD',
  people: [
    { id: 'a', name: 'Ana', color: 1 },
    { id: 'b', name: 'Ben', color: 2 },
  ],
  expenses: [],
  charges: [],
  settlements: [],
}

describe('categoryBreakdown', () => {
  it('sums per category, sorts descending, omits zero categories', () => {
    const data: TripData = {
      ...base,
      expenses: [
        expense({ id: 'e1', category: 'Food', amount: 30, participants: ['a', 'b'] }),
        expense({ id: 'e2', category: 'Lodging', amount: 100, participants: ['a', 'b'] }),
        expense({ id: 'e3', category: 'Food', amount: 20, participants: ['a'] }),
      ],
    }
    const slices = categoryBreakdown(data)
    expect(slices.map((s) => s.category)).toEqual(['Lodging', 'Food'])
    expect(slices[0]).toMatchObject({ total: 100 })
    expect(slices[1]).toMatchObject({ total: 50 })
    expect(round2(slices[0]!.pct + slices[1]!.pct)).toBe(1)
  })

  it('returns an empty list with no expenses', () => {
    expect(categoryBreakdown(base)).toEqual([])
  })
})

describe('personBreakdown', () => {
  it('paid minus share reconciles with computeBalances (no charges/settlements)', () => {
    const data: TripData = {
      ...base,
      expenses: [
        expense({ id: 'e1', amount: 99.99, paidBy: 'a', participants: ['a', 'b'] }),
        expense({
          id: 'e2',
          amount: 45.5,
          paidBy: 'b',
          participants: ['a', 'b'],
          splitMode: 'shares',
          splits: { a: 2, b: 1 },
        }),
        expense({
          id: 'e3',
          amount: 30,
          paidBy: 'a',
          participants: ['a', 'b'],
          splitMode: 'exact',
          splits: { a: 12.5, b: 17.5 },
        }),
      ],
    }
    const balances = computeBalances(data)
    for (const row of personBreakdown(data)) {
      // paid and share are rounded independently for display, so their
      // difference may drift up to a cent from the exact net balance.
      const drift = Math.abs(row.paid - row.share - (balances[row.personId] ?? 0))
      expect(drift).toBeLessThanOrEqual(0.01)
      expect(row.paid).toBe(round2(row.paid))
      expect(row.share).toBe(round2(row.share))
    }
  })
})
