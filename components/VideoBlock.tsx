interface VideoBlockProps {
  title: string;
  description?: string;
  url?: string;
  duration?: string;
  poster?: string;
}

export function VideoBlock({
  title,
  description,
  url,
  duration,
  poster
}: VideoBlockProps) {
  return (
    <div className="rounded-3xl overflow-hidden border border-ink-100 bg-white shadow-card my-6">
      <div
        className="aspect-video w-full bg-ink-900 grid place-items-center relative bg-cover bg-center"
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/60 to-ink-900/20" />
        <div className="relative text-center px-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/90 grid place-items-center shadow-pop">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-ink-900 ml-1"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className="mt-3 text-sand-50 font-medium text-sm uppercase tracking-wider">
            Video
            {duration ? ` · ${duration}` : ""}
          </p>
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-display text-lg tracking-tight !mt-0 !mb-1">
          {title}
        </h4>
        {description ? (
          <p className="text-sm text-ink-600 !my-0">{description}</p>
        ) : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-sm font-medium text-electric-600 !no-underline hover:underline"
          >
            Watch →
          </a>
        ) : (
          <p className="mt-3 text-xs text-ink-400">
            (placeholder · drop in a Loom/YouTube/Reel URL when ready)
          </p>
        )}
      </div>
    </div>
  );
}
