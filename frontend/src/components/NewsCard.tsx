import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface NewsCardProps {
  title: string;
  category: string;
  summary: string | null;
  url: string;
  published_at: string | null;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  immigration: { bg: "bg-blue-500/10", text: "text-blue-400" },
  tech: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  finance: { bg: "bg-amber-500/10", text: "text-amber-400" },
  default: { bg: "bg-slate-500/10", text: "text-slate-400" },
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
  const colors = categoryColors[category.toLowerCase()] || categoryColors.default;

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/50">
      {/* Header: Badge + Date */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            colors.bg,
            colors.text
          )}
        >
          {category}
        </span>
        {published_at && (
          <time className="text-[11px] text-slate-500">
            {new Date(published_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </time>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-[15px] font-semibold leading-snug text-slate-100 line-clamp-2">
        {title}
      </h3>

      {/* Summary */}
      {summary && (
        <p className="mb-3 flex-grow text-[13px] leading-relaxed text-slate-400 line-clamp-3">
          {summary}
        </p>
      )}

      {/* Read More Link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        Read article
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </article>
  );
}
