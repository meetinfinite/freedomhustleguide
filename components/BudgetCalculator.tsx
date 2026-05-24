"use client";

import { useMemo, useState } from "react";

interface Field {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  hint?: string;
}

const FIELDS: Field[] = [
  {
    key: "rent",
    label: "Rent",
    min: 300,
    max: 2500,
    step: 50,
    default: 800,
    hint: "Condo, 30-day stay, mid-range area"
  },
  {
    key: "food",
    label: "Food",
    min: 150,
    max: 1200,
    step: 25,
    default: 400,
    hint: "Mix of street food, cafes, occasional nice dinner"
  },
  {
    key: "cafes",
    label: "Cafes & coffee",
    min: 0,
    max: 400,
    step: 10,
    default: 120
  },
  {
    key: "coworking",
    label: "Coworking",
    min: 0,
    max: 350,
    step: 10,
    default: 0,
    hint: "0 if you mostly use cafes"
  },
  {
    key: "transport",
    label: "Transport",
    min: 30,
    max: 250,
    step: 10,
    default: 80,
    hint: "BTS + Grab, no scooter"
  },
  {
    key: "gym",
    label: "Gym / wellness",
    min: 0,
    max: 250,
    step: 10,
    default: 60
  },
  {
    key: "entertainment",
    label: "Entertainment",
    min: 0,
    max: 600,
    step: 20,
    default: 150,
    hint: "Bars, weekends, trips, massages"
  }
];

export function BudgetCalculator() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.default]))
  );

  const total = useMemo(
    () => Object.values(values).reduce((a, b) => a + b, 0),
    [values]
  );

  let tier: "Lean" | "Balanced" | "Premium" = "Balanced";
  if (total < 1100) tier = "Lean";
  else if (total > 2200) tier = "Premium";

  return (
    <div className="rounded-3xl border border-ink-100 bg-white shadow-card p-7 my-8">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <div>
          <h4 className="font-display text-2xl tracking-tight !mt-0 !mb-1">
            Your monthly estimate
          </h4>
          <p className="text-sm text-ink-500 !my-0">
            Adjust the sliders. Saves nothing — just for vibes.
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl text-electric-600 leading-none">
            £{total.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-wider text-ink-500 font-semibold mt-1">
            {tier} setup
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-sm font-medium text-ink-800">
                {f.label}
              </label>
              <span className="text-sm font-semibold text-ink-900">
                £{values[f.key]}
              </span>
            </div>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={values[f.key]}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  [f.key]: Number(e.target.value)
                }))
              }
              className="w-full accent-electric-500"
            />
            {f.hint ? (
              <p className="text-xs text-ink-400 mt-1 !my-0">{f.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
