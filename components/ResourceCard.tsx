interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
  category?: string;
}

export function ResourceCard({
  title,
  description,
  href,
  category
}: ResourceCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl bg-white border border-ink-100 shadow-card p-5 my-3 !no-underline flex items-start justify-between gap-3 hover:shadow-pop hover:-translate-y-0.5 transition"
    >
      <div>
        {category ? (
          <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold !my-0">
            {category}
          </p>
        ) : null}
        <h4 className="font-semibold text-ink-900 !mt-0.5 !mb-1 text-base">
          {title}
        </h4>
        <p className="text-sm text-ink-600 !my-0">{description}</p>
      </div>
      <span className="text-electric-600 text-lg group-hover:translate-x-0.5 transition shrink-0">
        ↗
      </span>
    </a>
  );
}
