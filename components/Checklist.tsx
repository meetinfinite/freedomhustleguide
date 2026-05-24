"use client";

import { useEffect, useState } from "react";

interface ChecklistProps {
  id: string;
  title?: string;
  items: string[];
}

export function Checklist({ id, title, items }: ChecklistProps) {
  const storageKey = `fh:checklist:${id}`;
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [storageKey]);

  function toggle(i: number) {
    const next = { ...done, [i]: !done[i] };
    setDone(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const completed = Object.values(done).filter(Boolean).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-6 my-6">
      {title ? (
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-xl tracking-tight !mt-0 !mb-0">
            {title}
          </h4>
          {mounted ? (
            <span className="text-xs font-semibold text-ink-500">
              {completed}/{items.length} done
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-electric-500 transition-all"
          style={{ width: `${mounted ? pct : 0}%` }}
        />
      </div>

      <ul className="space-y-2 list-none !pl-0">
        {items.map((item, i) => {
          const isDone = mounted && done[i];
          return (
            <li
              key={i}
              className="!pl-0 before:hidden flex items-start gap-3"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={Boolean(isDone)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                  isDone
                    ? "bg-electric-500 border-electric-500 text-white"
                    : "bg-white border-ink-200 hover:border-ink-400"
                }`}
              >
                {isDone ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 011.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
                    />
                  </svg>
                ) : null}
              </button>
              <span
                className={`text-base text-ink-800 leading-relaxed ${
                  isDone ? "line-through text-ink-400" : ""
                }`}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
