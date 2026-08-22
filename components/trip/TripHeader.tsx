"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { MapPin, Pencil, X } from "lucide-react";
import { upsertTrip } from "@/app/actions/trip";
import { formatPence } from "@/lib/money";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { formatDateRangeLabel } from "./format";

export function TripHeader({
  seasonId,
  destination,
  startDate,
  endDate,
  budget,
}: {
  seasonId: string;
  destination: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  budget: { categoryId: string; spentPence: number; budgetPence: number } | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(upsertTrip, null);
  const wasPending = useRef(false);

  // Collapse back to the read-only view once a save completes cleanly —
  // matches the edit-row pattern elsewhere (e.g. PurchaseRow), just driven
  // off useActionState's pending flag instead of an onSaved callback since
  // this form is wired straight to the action.
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  const hasBudget = Boolean(budget && budget.budgetPence > 0);
  const over = Boolean(budget && hasBudget && budget.spentPence > budget.budgetPence);
  const percent = budget && hasBudget ? (budget.spentPence / budget.budgetPence) * 100 : 0;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="flex items-center gap-2 font-festive text-3xl text-pine-deep sm:text-4xl">
            <MapPin className="h-6 w-6 text-berry" aria-hidden />
            {destination}
          </h1>
          <p className="text-sm text-cocoa-soft">
            {formatDateRangeLabel(new Date(startDate), new Date(endDate))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-label={editing ? "Cancel editing trip" : "Edit trip"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pine text-pine transition hover:bg-pine/10"
        >
          {editing ? <X size={16} /> : <Pencil size={16} />}
        </button>
      </div>

      {editing && (
        <form action={formAction} className="flex flex-col gap-3 rounded-2xl bg-cream/60 p-4">
          <input type="hidden" name="seasonId" value={seasonId} />
          <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
            Destination
            <input
              name="destination"
              defaultValue={destination}
              required
              className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
              Arrive
              <input
                type="date"
                name="startDate"
                defaultValue={startDate}
                required
                className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-cocoa-soft">
              Leave
              <input
                type="date"
                name="endDate"
                defaultValue={endDate}
                required
                className="rounded-xl border border-cocoa-soft/30 px-3 py-2 text-cocoa"
              />
            </label>
          </div>
          {state?.error && <p className="text-sm text-berry-deep">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-berry px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-berry-deep disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={pending}
              className="rounded-full border border-pine px-5 py-2 text-sm font-semibold text-pine transition hover:bg-pine/10 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {budget && (
        <div className="flex flex-col gap-2 rounded-2xl bg-tag px-4 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
              City Break budget
            </span>
            {hasBudget && (
              <span className={`text-xs font-semibold ${over ? "text-berry" : "text-cocoa-soft"}`}>
                {Math.round(percent)}%
              </span>
            )}
          </div>
          {hasBudget ? (
            <>
              <ProgressBar percent={percent} over={over} track="white" />
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-cocoa">{formatPence(budget.spentPence)}</span>
                <span className="text-cocoa-soft">of {formatPence(budget.budgetPence)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-cocoa">
              {formatPence(budget.spentPence)} spent
            </p>
          )}
          <Link
            href={`/purchases?category=${budget.categoryId}`}
            className="self-start text-xs font-semibold text-pine-deep underline-offset-2 hover:underline"
          >
            See purchases
          </Link>
        </div>
      )}
    </div>
  );
}
