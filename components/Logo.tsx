import Link from "next/link";

/**
 * The هـ monogram — "H" for Hoda in Arabic (heh + tatweel),
 * set in the identity blue on a hairline-bordered tile.
 */
export function Logo({ withName = true }: { withName?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label="Hoda Hashemi — home"
    >
      <span
        aria-hidden="true"
        className="monogram flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-[1.35rem] text-accent transition-colors duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast"
      >
        هـ
      </span>
      {withName && (
        <span className="text-[0.95rem] font-semibold tracking-tight">
          Hoda Hashemi
        </span>
      )}
    </Link>
  );
}
