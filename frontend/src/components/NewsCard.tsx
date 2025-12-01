import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface NewsCardProps {
  title: string;
  category: string;
  summary: string | null;
  url: string;
  published_at: string | null;
}

const categoryColors: Record<string, string> = {
  immigration: "bg-blue-600",
  tech: "bg-emerald-600",
  finance: "bg-amber-600",
  default: "bg-slate-600",
};

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function NewsCard({
  title,
  category,
  summary,
  url,
  published_at,
}: NewsCardProps) {
  const badgeColor = categoryColors[category.toLowerCase()] || categoryColors.default;

  return (
    <article className="group relative flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide text-white",
            badgeColor
          )}
        >
          {category}
        </span>
        {published_at && (
          <time className="text-xs text-slate-500">
            {new Date(published_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        )}
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-tight text-slate-50">
        {title}
      </h3>

      {summary && (
        <p className="mb-4 flex-grow text-sm leading-relaxed text-slate-400">
          {summary}
        </p>
      )}

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        Read more
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
