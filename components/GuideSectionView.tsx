"use client";

import Link from "next/link";
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMdxRenderer } from "./TinaMdxRenderer";
import { TinaEditRefresh } from "./TinaEditRefresh";
import type { GuideSection } from "@/lib/guides";

interface NavMeta {
  basePath: string;
  icon: string;
  readingTime: string;
  prev: GuideSection | null;
  next: GuideSection | null;
}

interface GuideSectionViewProps {
  data: any;
  query: string;
  variables: any;
  nav: NavMeta;
}

export function GuideSectionView({
  data: initial,
  query,
  variables,
  nav
}: GuideSectionViewProps) {
  // Reactive — when an editor types in /admin, this updates live without reload.
  const { data } = useTina({ query, variables, data: initial });
  const section = data.section;

  return (
    <div>
      <TinaEditRefresh />
      <div className="mb-8 flex items-center gap-3 text-sm text-ink-500">
        <Link href={nav.basePath} className="hover:text-ink-900">
          ← Dashboard
        </Link>
        <span>·</span>
        <span>{nav.readingTime}</span>
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 grid place-items-center text-2xl">
            {nav.icon}
          </div>
        </div>
        <h1
          data-tina-field={tinaField(section, "title")}
          className="font-display text-4xl sm:text-5xl tracking-tight"
        >
          {section.title}
        </h1>
        <p
          data-tina-field={tinaField(section, "description")}
          className="text-ink-600 mt-3 text-lg"
        >
          {section.description}
        </p>
      </header>

      <div data-tina-field={tinaField(section, "body")}>
        <TinaMdxRenderer content={section.body} />
      </div>

      <div className="mt-16 grid sm:grid-cols-2 gap-4">
        {nav.prev ? (
          <Link
            href={`${nav.basePath}/${nav.prev.slug}`}
            className="group rounded-2xl bg-white border border-ink-100 shadow-card p-5 hover:shadow-pop transition"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Previous
            </p>
            <p className="font-display text-lg tracking-tight mt-1">
              ← {nav.prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {nav.next ? (
          <Link
            href={`${nav.basePath}/${nav.next.slug}`}
            className="group rounded-2xl bg-white border border-ink-100 shadow-card p-5 hover:shadow-pop transition sm:text-right"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Next
            </p>
            <p className="font-display text-lg tracking-tight mt-1">
              {nav.next.title} →
            </p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
