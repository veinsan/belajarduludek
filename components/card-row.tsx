import Link from "next/link";

export function CardRow({
  title,
  viewAllHref,
  viewAllLabel = "Lihat semua",
  children,
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {viewAllLabel} →
          </Link>
        ) : null}
      </div>
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:-mx-10 md:px-10">
        {children}
      </div>
    </section>
  );
}
