import { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  valueClassName: string;
};

export function SummaryCard({
  title,
  value,
  description,
  detail,
  icon: Icon,
  valueClassName,
}: SummaryCardProps) {
  return (
    <article className="app-card group p-6 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium app-faint-text">{title}</p>

          <strong
            className={`mt-2 block text-2xl font-black tracking-[-0.03em] ${valueClassName}`}
          >
            {value}
          </strong>
        </div>

        <div className="app-icon-box h-12 w-12 transition group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm app-muted-text">{description}</p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium app-faint-text">
        {detail}
      </div>
    </article>
  );
}