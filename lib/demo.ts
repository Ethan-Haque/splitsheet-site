import {
  round2,
  shareOf,
  type Category,
  type Expense,
  type Person,
  type TripData,
} from '@/lib/expense-data'

/**
 * The live splitter's trip. It is the same trip splitsheet-web's production
 * smoke test (`e2e/smoke.spec.ts`) types into the real app, renamed: Ava is
 * that test's "Smoke Owner". So the figures a visitor sees first
 * (+$119.99 / −$65.00 / −$54.99) are also asserted against the deployed app,
 * and `test/demo.test.ts` pins them here.
 *
 * Ids sort in member order, which is what cent tie-breaks key off.
 */
export const DEMO_PEOPLE: Person[] = [
  { id: 'p1', name: 'Ava', color: 1 },
  { id: 'p2', name: 'Blake', color: 2 },
  { id: 'p3', name: 'Casey', color: 3 },
]

const EVERYONE = DEMO_PEOPLE.map((p) => p.id)

export const DEMO_SEED: TripData = {
  name: 'Weekend in Montréal',
  currency: '$',
  currencyCode: 'USD',
  people: DEMO_PEOPLE,
  expenses: [
    expense('e1', 'Hotel, 2 nights', 'Lodging', 'p1', 300),
    expense('e2', 'Dinner in the Plateau', 'Food', 'p2', 90),
    {
      ...expense('e3', 'Taxi to the airport', 'Transport', 'p3', 100.01),
      splitMode: 'shares',
      splits: { p1: 2, p2: 1, p3: 1 },
    },
  ],
  charges: [],
  settlements: [],
}

/** What "Add expense" inserts, in order; the demo stops offering it after these. */
const EXTRAS: Omit<Expense, 'id' | 'date' | 'participants' | 'splitMode'>[] = [
  { description: 'Bagels, twice', category: 'Food', paidBy: 'p2', amount: 23.4 },
  { description: 'Bike share passes', category: 'Activities', paidBy: 'p1', amount: 45 },
  { description: 'Dépanneur run', category: 'Groceries', paidBy: 'p3', amount: 31.75 },
]

export const MAX_EXPENSES = DEMO_SEED.expenses.length + EXTRAS.length

/** Upper bound on a share weight; the demo's steppers stop here. */
export const MAX_WEIGHT = 9

function expense(
  id: string,
  description: string,
  category: Category,
  paidBy: string,
  amount: number,
): Expense {
  return {
    id,
    date: '2026-06-12',
    description,
    category,
    paidBy,
    amount,
    participants: [...EVERYONE],
    splitMode: 'equal',
  }
}

export type DemoAction =
  | { type: 'setAmount'; id: string; amount: number }
  | { type: 'setPaidBy'; id: string; personId: string }
  | { type: 'setMode'; id: string; mode: 'equal' | 'shares' }
  | { type: 'setWeight'; id: string; personId: string; weight: number }
  | { type: 'toggleParticipant'; id: string; personId: string }
  | { type: 'add' }
  | { type: 'remove'; id: string }
  | { type: 'reset' }

/**
 * Pure state transitions for the live splitter. Every action leaves the trip
 * in a shape the app itself could have produced: amounts are whole cents and
 * non-negative, an expense always has at least one participant, and a shares
 * split carries a positive weight for each participant and no one else.
 */
export function demoReducer(state: TripData, action: DemoAction): TripData {
  switch (action.type) {
    case 'reset':
      return DEMO_SEED
    case 'add': {
      // First extra not already on the sheet, so remove-then-add never duplicates.
      const shown = new Set(state.expenses.map((e) => e.description))
      const extra = EXTRAS.find((x) => !shown.has(x.description))
      if (!extra || state.expenses.length >= MAX_EXPENSES) return state
      const id = nextId(state)
      return {
        ...state,
        expenses: [
          ...state.expenses,
          expense(id, extra.description, extra.category, extra.paidBy, extra.amount),
        ],
      }
    }
    case 'remove':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }
    default:
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id ? editExpense(e, action) : e)),
      }
  }
}

function editExpense(e: Expense, action: DemoAction): Expense {
  switch (action.type) {
    case 'setAmount':
      return Number.isFinite(action.amount)
        ? { ...e, amount: round2(Math.max(0, action.amount)) }
        : e
    case 'setPaidBy':
      return { ...e, paidBy: action.personId }
    case 'setMode':
      if (action.mode === 'equal') {
        return { ...e, splitMode: 'equal', splits: undefined }
      }
      return e.splitMode === 'shares'
        ? e
        : { ...e, splitMode: 'shares', splits: weightsFor(e.participants) }
    case 'setWeight': {
      if (e.splitMode !== 'shares' || !e.participants.includes(action.personId)) return e
      const weight = Math.min(MAX_WEIGHT, Math.max(1, Math.round(action.weight)))
      return { ...e, splits: { ...e.splits, [action.personId]: weight } }
    }
    case 'toggleParticipant': {
      const on = e.participants.includes(action.personId)
      if (on && e.participants.length === 1) return e
      // Kept in member order so the ledger's avatar stack never reshuffles.
      const participants = on
        ? e.participants.filter((id) => id !== action.personId)
        : EVERYONE.filter((id) => id === action.personId || e.participants.includes(id))
      if (e.splitMode !== 'shares') return { ...e, participants }
      const splits: Record<string, number> = {}
      for (const id of participants) splits[id] = e.splits?.[id] ?? 1
      return { ...e, participants, splits }
    }
    default:
      return e
  }
}

function weightsFor(ids: string[]): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, 1]))
}

function nextId(state: TripData): string {
  const taken = new Set(state.expenses.map((e) => e.id))
  let n = state.expenses.length + 1
  while (taken.has(`e${n}`)) n++
  return `e${n}`
}

export type AnatomyRow = {
  personId: string
  weight: number
  /** Exact, unrounded share in cents — what a naive split would show. */
  exactCents: number
  flooredCents: number
  /** 1 if this person receives one of the leftover cents, else 0. */
  bonusCents: 0 | 1
  /** The share the app actually charges, straight from `shareOf`. */
  share: number
}

/**
 * The largest-remainder allocation of one shares/equal expense, step by step,
 * for the page's "anatomy of a split" walkthrough.
 *
 * The walkthrough re-derives the steps itself, since the app's allocator is
 * private, but `share` comes from the vendored `shareOf`. The test suite checks
 * that floor + bonus always lands on it, so the explanation cannot drift from
 * what the app does.
 */
export function splitAnatomy(e: Expense): AnatomyRow[] {
  const totalCents = Math.round(round2(e.amount) * 100)
  const ids = [...e.participants].sort()
  const weights = ids.map((id) => (e.splitMode === 'equal' ? 1 : (e.splits?.[id] ?? 0)))
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const exact = ids.map((_, i) => (totalWeight > 0 ? (totalCents * weights[i]) / totalWeight : 0))
  const floored = exact.map(Math.floor)
  let leftover = totalCents - floored.reduce((s, c) => s + c, 0)
  const winners = new Set<string>()
  for (const { id } of ids
    .map((id, i) => ({ id, frac: exact[i] - floored[i] }))
    .sort((a, b) => b.frac - a.frac || (a.id < b.id ? -1 : 1))) {
    if (leftover <= 0) break
    winners.add(id)
    leftover--
  }
  return ids.map((id, i) => ({
    personId: id,
    weight: weights[i],
    exactCents: exact[i],
    flooredCents: floored[i],
    bonusCents: winners.has(id) ? 1 : 0,
    share: shareOf(e, id),
  }))
}

/**
 * The counterexample from the doc comment on `computeSettlements`: nets of
 * {+4, +3, −1, −3, −3}, which the greedy plan clears in four payments where
 * three would do. The page shows both plans side by side.
 */
export const GREEDY_CASE: TripData = (() => {
  const nets: [string, number][] = [
    ['Ana', 4],
    ['Ben', 3],
    ['Cy', -1],
    ['Dee', -3],
    ['Eli', -3],
  ]
  return {
    ...DEMO_SEED,
    people: nets.map(([name], i) => ({ id: `g${i + 1}`, name, color: (i + 1) as Person['color'] })),
    expenses: [],
    settlements: [],
    // One direct charge per person against a counterparty outside the trip.
    // computeBalances skips ids that are not members, so each member's net
    // comes out as exactly the figure above.
    charges: nets.map(([, net], i) => ({
      id: `c${i + 1}`,
      from: net < 0 ? `g${i + 1}` : 'outside',
      to: net < 0 ? 'outside' : `g${i + 1}`,
      description: '',
      amount: Math.abs(net),
    })),
  }
})()

/** A three-payment plan for GREEDY_CASE, found by hand; the tests check it clears everyone. */
export const GREEDY_OPTIMAL = [
  { from: 'g4', to: 'g2', amount: 3 },
  { from: 'g5', to: 'g1', amount: 3 },
  { from: 'g3', to: 'g1', amount: 1 },
]
