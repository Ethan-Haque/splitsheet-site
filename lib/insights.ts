import {
  CATEGORIES,
  round2,
  totalPaidBy,
  totalShareOf,
  tripTotal,
  type Category,
  type TripData,
} from '@/lib/expense-data'

export type CategorySlice = {
  category: Category
  total: number
  /** Share of the trip total, 0–1. */
  pct: number
}

/** Spending per category, largest first; zero categories omitted. */
export function categoryBreakdown(data: TripData): CategorySlice[] {
  const totals = new Map<Category, number>()
  for (const e of data.expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  const total = tripTotal(data)
  return CATEGORIES.filter((c) => (totals.get(c) ?? 0) > 0)
    .map((category) => {
      const sum = totals.get(category)!
      return {
        category,
        total: round2(sum),
        pct: total > 0 ? sum / total : 0,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export type PersonSpend = {
  personId: string
  /** Sum of expenses this person fronted. */
  paid: number
  /** Sum of this person's shares across all expenses. */
  share: number
}

/** Paid vs. owed-share per member, in trip member order. */
export function personBreakdown(data: TripData): PersonSpend[] {
  return data.people.map((p) => ({
    personId: p.id,
    paid: round2(totalPaidBy(data, p.id)),
    share: round2(totalShareOf(data, p.id)),
  }))
}
