'use client'

import { useMemo, useReducer, useState } from 'react'
import { ArrowRight, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/primitives'
import { DEMO_SEED, MAX_EXPENSES, MAX_WEIGHT, demoReducer, type DemoAction } from '@/lib/demo'
import {
  balanceDirection,
  computeBalances,
  computeSettlements,
  formatMoney,
  personById,
  tripTotal,
  type Expense,
  type Person,
  type TripData,
} from '@/lib/expense-data'
import { personBreakdown } from '@/lib/insights'
import { cn } from '@/lib/utils'

const card =
  'overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/[0.06] dark:shadow-black/50'

/**
 * A three-person trip you can edit, with balances and the settle-up plan
 * recomputed on every change. Nothing here does arithmetic: the numbers come
 * from the app's own `computeBalances` / `computeSettlements`, vendored
 * unchanged (see tools/verify-vendor.mjs).
 */
export function LiveSplitter() {
  const [trip, dispatch] = useReducer(demoReducer, DEMO_SEED)
  const balances = useMemo(() => computeBalances(trip), [trip])
  const transfers = useMemo(() => computeSettlements(trip, balances), [trip, balances])
  const spend = useMemo(() => personBreakdown(trip), [trip])
  const total = tripTotal(trip)
  const edited = trip !== DEMO_SEED

  return (
    <section aria-labelledby="demo-title" className={card}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <h2 id="demo-title" className="truncate font-semibold tracking-tight">
            {trip.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="mr-1.5 inline-block size-1.5 translate-y-[-1px] rounded-full bg-primary align-middle" />
            Live demo · edit anything
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold tabular-nums">{formatMoney(total)}</p>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Trip total
          </p>
        </div>
      </header>

      <ol className="divide-y divide-border" aria-label="Expenses">
        {trip.expenses.map((e) => (
          <ExpenseRow key={e.id} expense={e} trip={trip} dispatch={dispatch} />
        ))}
      </ol>

      <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5 sm:px-5">
        <button
          type="button"
          onClick={() => dispatch({ type: 'add' })}
          disabled={trip.expenses.length >= MAX_EXPENSES}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-primary hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
          Add expense
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'reset' })}
          disabled={!edited}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="grid border-t border-border sm:grid-cols-2">
        <Balances trip={trip} balances={balances} spend={spend} />
        <SettleUp trip={trip} transfers={transfers} />
      </div>
    </section>
  )
}

function ExpenseRow({
  expense: e,
  trip,
  dispatch,
}: {
  expense: Expense
  trip: TripData
  dispatch: React.Dispatch<DemoAction>
}) {
  const shares = e.splitMode === 'shares'
  const payerSelectId = `${e.id}-payer`

  return (
    <li className="px-4 py-2.5 sm:px-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{e.description}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-px text-[11px]">{e.category}</span>
            <label htmlFor={payerSelectId}>paid by</label>
            <select
              id={payerSelectId}
              value={e.paidBy}
              onChange={(ev) => dispatch({ type: 'setPaidBy', id: e.id, personId: ev.target.value })}
              className="-ml-0.5 rounded bg-transparent py-0.5 pr-1 font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {trip.people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </p>
        </div>
        <AmountInput
          amount={e.amount}
          label={`${e.description} amount`}
          onCommit={(amount) => dispatch({ type: 'setAmount', id: e.id, amount })}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div role="group" aria-label={`${e.description} split mode`} className="flex rounded-md bg-muted p-0.5 text-xs">
          {(['equal', 'shares'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={e.splitMode === mode}
              onClick={() => dispatch({ type: 'setMode', id: e.id, mode })}
              className={cn(
                'rounded px-2 py-1 font-medium capitalize text-muted-foreground transition-colors',
                e.splitMode === mode && 'bg-card text-foreground shadow-sm',
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <div role="group" aria-label={`Who ${e.description} is split between`} className="flex items-center gap-1">
          {trip.people.map((p) => {
            const on = e.participants.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                aria-label={`Split with ${p.name}`}
                title={on ? `Remove ${p.name} from this split` : `Add ${p.name} to this split`}
                onClick={() => dispatch({ type: 'toggleParticipant', id: e.id, personId: p.id })}
                className="rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <Avatar person={p} faded={!on} />
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: 'remove', id: e.id })}
          aria-label={`Remove ${e.description}`}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      </div>

      {shares && (
        <div className="mt-2 flex flex-wrap gap-2">
          {e.participants.map((id) => {
            const p = personById(trip, id)
            if (!p) return null
            return (
              <WeightStepper
                key={id}
                person={p}
                weight={e.splits?.[id] ?? 1}
                onChange={(weight) => dispatch({ type: 'setWeight', id: e.id, personId: id, weight })}
              />
            )
          })}
        </div>
      )}
    </li>
  )
}

function parseAmount(text: string): number | null {
  const n = Number(text.replace(/[$,\s]/g, ''))
  return text.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Commits on every keystroke that parses, so balances move as you type, but
 * keeps its own text so a half-typed "12." is not reformatted out from under
 * the cursor. The text is resynced when the amount changes from outside (Reset).
 */
function AmountInput({
  amount,
  label,
  onCommit,
}: {
  amount: number
  label: string
  onCommit: (amount: number) => void
}) {
  const [text, setText] = useState(amount.toFixed(2))
  const [seen, setSeen] = useState(amount)
  if (amount !== seen) {
    setSeen(amount)
    if (parseAmount(text) !== amount) setText(amount.toFixed(2))
  }

  return (
    <label className="flex h-8 w-[6.5rem] shrink-0 items-center rounded-md border border-input bg-background px-2 font-mono text-sm tabular-nums focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
      <span className="text-muted-foreground" aria-hidden>
        $
      </span>
      <span className="sr-only">{label}</span>
      <input
        inputMode="decimal"
        value={text}
        onChange={(ev) => {
          setText(ev.target.value)
          const n = parseAmount(ev.target.value)
          if (n !== null) onCommit(n)
        }}
        onBlur={() => setText(amount.toFixed(2))}
        className="w-full min-w-0 bg-transparent text-right outline-none"
      />
    </label>
  )
}

function WeightStepper({
  person,
  weight,
  onChange,
}: {
  person: Person
  weight: number
  onChange: (weight: number) => void
}) {
  const btn =
    'flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
  return (
    <div
      role="group"
      aria-label={`${person.name}'s shares`}
      className="flex items-center gap-1 rounded-md border border-border py-0.5 pr-0.5 pl-1.5"
    >
      <Avatar person={person} size="sm" />
      <button type="button" className={btn} onClick={() => onChange(weight - 1)} disabled={weight <= 1} aria-label={`Fewer shares for ${person.name}`}>
        <Minus className="size-3" aria-hidden />
      </button>
      <span className="w-3 text-center font-mono text-xs tabular-nums" aria-live="polite">
        {weight}
      </span>
      <button type="button" className={btn} onClick={() => onChange(weight + 1)} disabled={weight >= MAX_WEIGHT} aria-label={`More shares for ${person.name}`}>
        <Plus className="size-3" aria-hidden />
      </button>
    </div>
  )
}

function Balances({
  trip,
  balances,
  spend,
}: {
  trip: TripData
  balances: Record<string, number>
  spend: ReturnType<typeof personBreakdown>
}) {
  const largest = Math.max(0.01, ...Object.values(balances).map(Math.abs))

  return (
    <div className="px-4 py-4 sm:px-5">
      <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Balances</h3>
      <ul className="mt-3 space-y-2.5">
        {trip.people.map((p) => {
          const net = balances[p.id] ?? 0
          const dir = balanceDirection(net)
          const s = spend.find((x) => x.personId === p.id)
          return (
            <li key={p.id}>
              <div className="flex items-center gap-2">
                <Avatar person={p} size="sm" />
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <span
                  className={cn(
                    'font-mono text-sm font-semibold tabular-nums',
                    dir === 'up' && 'text-primary',
                    dir === 'down' && 'text-destructive',
                    dir === 'even' && 'text-muted-foreground',
                  )}
                >
                  {dir === 'up' ? '+' : dir === 'down' ? '−' : ''}
                  {formatMoney(Math.abs(net))}
                </span>
              </div>
              {/* Diverging bar: right of centre gets back, left of centre owes. */}
              <div className="relative mt-1.5 h-1.5 rounded-full bg-muted" aria-hidden>
                <span className="absolute inset-y-0 left-1/2 w-px bg-border" />
                <span
                  className={cn(
                    'absolute inset-y-0 rounded-full transition-all duration-300',
                    dir === 'up' ? 'left-1/2 bg-primary' : 'right-1/2 bg-destructive',
                  )}
                  style={{ width: `${(Math.abs(net) / largest) * 50}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                paid {formatMoney(s?.paid ?? 0)} · share {formatMoney(s?.share ?? 0)}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SettleUp({
  trip,
  transfers,
}: {
  trip: TripData
  transfers: ReturnType<typeof computeSettlements>
}) {
  return (
    <div className="border-t border-border px-4 py-4 sm:border-t-0 sm:border-l sm:px-5">
      <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        Settle up
        <span className="ml-1.5 rounded-full bg-accent px-1.5 py-px font-mono text-accent-foreground normal-case">
          {transfers.length} {transfers.length === 1 ? 'payment' : 'payments'}
        </span>
      </h3>
      <div aria-live="polite">
        {transfers.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Everyone is squared up. Nothing to settle.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {transfers.map((t) => {
              const from = personById(trip, t.from)
              const to = personById(trip, t.to)
              if (!from || !to) return null
              return (
                <li
                  key={`${t.from}-${t.to}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2"
                >
                  <Avatar person={from} size="sm" />
                  <span className="flex min-w-0 flex-1 items-center gap-1 text-sm">
                    <span className="truncate">{from.name}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="sr-only">pays</span>
                    <span className="truncate">{to.name}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums">{formatMoney(t.amount)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Computed by the app&apos;s own <code className="font-mono">computeSettlements()</code>, running in your browser.
      </p>
    </div>
  )
}
