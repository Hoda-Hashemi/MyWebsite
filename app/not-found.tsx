import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
      <p className="tag">Error 404</p>
      <span aria-hidden="true" className="mark-glyph mt-8 block h-24 w-40" />
      <h1 className="mt-6 text-3xl font-semibold md:text-4xl">
        This page diverged.
      </h1>
      <p className="mt-3 max-w-sm text-muted">
        The solution you requested does not exist on this grid.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to stable state
      </Link>
    </div>
  );
}
