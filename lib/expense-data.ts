/** Index into the chart color palette. */
export type ChartColor = 1 | 2 | 3 | 4 | 5

export type Person = {
  id: string
  name: string
  color: ChartColor
  /** Account id of the linked user; null/absent for ghost members. */
  userId?: string | null
  role?: 'owner' | 'member'
}

/**
 * How an expense divides between its participants: equally, by integer share
 * weights, or by exact per-person amounts. Percent splits are a UI affordance
 * compiled to `shares` (percent × 100).
 */
export type SplitMode = 'equal' | 'shares' | 'exact'

export type Expense = {
  id: string
  date: string // ISO yyyy-mm-dd
  description: string
  category: Category
  /** person id who paid */
  paidBy: string
  amount: number
  /** person ids splitting this expense */
  participants: string[]
  splitMode: SplitMode
  /** Per-member share weights ('shares') or dollars ('exact'); absent for 'equal'. */
  splits?: Record<string, number>
  /** Path to an uploaded receipt image (relative to the API origin); null clears it. */
  receiptUrl?: string | null
}

/**
 * A comment on an expense. Deliberately separate from the money model — it
 * carries no amount and never enters balance or settlement math. Author
 * identity is denormalized so a thread still renders after the author leaves.
 */
export type Comment = {
  id: string
  expenseId: string
  /** Author's trip-member id; null if they were later removed from the trip. */
  authorMemberId: string | null
  /** Author's account id; null if the account was deleted. Drives the
      own-comment delete affordance. */
  authorUserId: string | null
  authorName: string
  authorColor: ChartColor
  body: string
  createdAt: string
}

/** A direct, person-to-person charge: `from` owes `to` the amount. */
export type DirectCharge = {
  id: string
  from: string
  to: string
  description: string
  amount: number
}

/** A recorded payment: `from` paid `to` to settle up. */
export type Settlement = {
  id: string
  from: string
  to: string
  date: string // ISO yyyy-mm-dd
  note: string
  amount: number
}

export type TripData = {
  name: string
  /** Display symbol (e.g. '¥'), used as an input adornment; ambiguous across
      currencies — use `currencyCode` for formatting amounts. */
  currency: string
  /** ISO 4217 code (e.g. 'JPY'). */
  currencyCode: string
  people: Person[]
  expenses: Expense[]
  charges: DirectCharge[]
  settlements: Settlement[]
}

export const CATEGORIES = [
  'Lodging',
  'Food',
  'Transport',
  'Activities',
  'Groceries',
  'Drinks',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Balances within this of zero count as settled (cent-rounding noise). */
export const BALANCE_EPSILON = 0.005

export type BalanceDirection = 'up' | 'down' | 'even'

/** Caption under a net balance. Lower case; the sheets that want it shouting
    apply `uppercase` themselves. */
export const DIRECTION_CAPTION: Record<BalanceDirection, string> = {
  up: 'gets back',
  down: 'owes',
  even: 'settled up',
}

/** Whether a net balance means the person gets money back, owes, or is settled. */
export function balanceDirection(net: number): BalanceDirection {
  if (net > BALANCE_EPSILON) return 'up'
  if (net < -BALANCE_EPSILON) return 'down'
  return 'even'
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/** Each person's share of a single expense (0 if not a participant). */
export function shareOf(expense: Expense, personId: string): number {
  if (!expense.participants.includes(personId)) return 0
  if (expense.splitMode === 'exact') return expense.splits?.[personId] ?? 0
  return (sharesSplitCents(expense)[personId] ?? 0) / 100
}

/**
 * Whole-cent shares for a weighted split. Largest-remainder method over a
 * deterministic order (fraction desc, then member id), so every client and
 * ledger shows the same cents and they always sum to the total exactly.
 *
 * 'equal' runs through here too, as a split where everyone carries weight 1.
 * Dividing the amount directly would be a cent short on anything that does not
 * divide evenly: $100 three ways displays as 33.33 x 3 = 99.99.
 */
function sharesSplitCents(expense: Expense): Record<string, number> {
  const totalCents = Math.round(round2(expense.amount) * 100)
  const ids = [...expense.participants].sort()
  const weights = ids.map((id) =>
    expense.splitMode === 'equal' ? 1 : (expense.splits?.[id] ?? 0),
  )
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const out: Record<string, number> = {}
  if (totalWeight <= 0) {
    for (const id of ids) out[id] = 0
    return out
  }
  const raw = ids.map((_, i) => (totalCents * weights[i]) / totalWeight)
  let remainder = totalCents
  for (const [i, id] of ids.entries()) {
    out[id] = Math.floor(raw[i])
    remainder -= out[id]
  }
  const byRemainder = ids
    .map((id, i) => ({ id, frac: raw[i] - Math.floor(raw[i]) }))
    .sort((a, b) => b.frac - a.frac || (a.id < b.id ? -1 : 1))
  for (const { id } of byRemainder) {
    if (remainder <= 0) break
    out[id] += 1
    remainder -= 1
  }
  return out
}

/**
 * Net balance per person across all shared expenses AND direct charges.
 * Positive => the group owes this person (they are up).
 * Negative => this person owes the group.
 */
export function computeBalances(data: TripData): Record<string, number> {
  const bal: Record<string, number> = {}
  for (const p of data.people) bal[p.id] = 0

  for (const e of data.expenses) {
    if (bal[e.paidBy] !== undefined) bal[e.paidBy] += e.amount
    for (const pid of e.participants) {
      if (bal[pid] !== undefined) bal[pid] -= shareOf(e, pid)
    }
  }

  for (const c of data.charges) {
    if (bal[c.from] !== undefined) bal[c.from] -= c.amount
    if (bal[c.to] !== undefined) bal[c.to] += c.amount
  }

  // A recorded payment moves the payer's balance up and the payee's down.
  for (const s of data.settlements) {
    if (bal[s.from] !== undefined) bal[s.from] += s.amount
    if (bal[s.to] !== undefined) bal[s.to] -= s.amount
  }

  return bal
}

export function totalPaidBy(data: TripData, personId: string): number {
  return data.expenses
    .filter((e) => e.paidBy === personId)
    .reduce((s, e) => s + e.amount, 0)
}

export function totalShareOf(data: TripData, personId: string): number {
  return data.expenses.reduce((s, e) => s + shareOf(e, personId), 0)
}

export function tripTotal(data: TripData): number {
  return data.expenses.reduce((s, e) => s + e.amount, 0)
}

/** A suggested settle-up payment (not yet recorded). */
export type Transfer = { from: string; to: string; amount: number }

/**
 * Greedy settlement plan from net balances: repeatedly pay the largest debtor
 * into the largest creditor.
 *
 * Not guaranteed minimal — minimizing the transfer count reduces to subset-sum
 * and is NP-hard. This is the O(n log n) approximation: never worse than n-1
 * transfers, and occasionally one above optimal. Balances
 * {a:+4, b:+3, c:-1, d:-3, e:-3} settle here in 4, where 3 would do.
 */
export function computeSettlements(
  data: TripData,
  balances: Record<string, number> = computeBalances(data),
): Transfer[] {
  const debtors: { id: string; amt: number }[] = []
  const creditors: { id: string; amt: number }[] = []

  for (const p of data.people) {
    const v = round2(balances[p.id] ?? 0)
    if (v < -BALANCE_EPSILON) debtors.push({ id: p.id, amt: -v })
    else if (v > BALANCE_EPSILON) creditors.push({ id: p.id, amt: v })
  }

  debtors.sort((a, b) => b.amt - a.amt)
  creditors.sort((a, b) => b.amt - a.amt)

  const settlements: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt)
    if (pay > BALANCE_EPSILON) {
      settlements.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: round2(pay),
      })
    }
    debtors[i].amt -= pay
    creditors[j].amt -= pay
    if (debtors[i].amt < BALANCE_EPSILON) i++
    if (creditors[j].amt < BALANCE_EPSILON) j++
  }
  return settlements
}

export function round2(n: number): number {
  // Rounds the magnitude and reapplies the sign. Math.round breaks ties toward
  // +Infinity, so rounding n directly sends -1.005 to -1.00 while 1.005 goes to
  // 1.01, and balances that should mirror each other stop cancelling out. The
  // epsilon covers half-cents stored just under the line (1.005 is really
  // 1.00499...) and has to be added before scaling, where it is still wide
  // enough to move the value. Trailing `+ 0` turns a -0 result back into 0,
  // which would otherwise format as "-$0.00".
  const sign = n < 0 ? -1 : 1
  return (sign * Math.round((Math.abs(n) + Number.EPSILON) * 100)) / 100 + 0
}

/* Locale is pinned to en-US (like formatDate below): components are
   SSR-prerendered, and a viewer-dependent locale would hydrate differently. */
const moneyFormatters = new Map<string, Intl.NumberFormat>()

function moneyFormatter(currencyCode: string): Intl.NumberFormat {
  let f = moneyFormatters.get(currencyCode)
  if (!f) {
    try {
      f = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })
    } catch {
      // Unknown/invalid code (bad data): fall back rather than crash a render.
      f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    }
    moneyFormatters.set(currencyCode, f)
  }
  return f
}

/** Format an amount in a currency given by ISO 4217 code. Zero-decimal
    currencies (JPY, KRW, …) render without fraction digits. */
export function formatMoney(n: number, currencyCode = 'USD'): string {
  return moneyFormatter(currencyCode).format(n)
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function personById(data: TripData, id: string): Person | undefined {
  return data.people.find((p) => p.id === id)
}
