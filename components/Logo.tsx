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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand-mark.png"
        alt=""
        aria-hidden="true"
        className="h-7 w-auto transition-transform duration-300 group-hover:-rotate-6"
      />
      {withName && (
        <span className="text-[0.95rem] font-semibold tracking-tight">
          Hoda Hashemi
        </span>
      )}
    </Link>
  );
}
