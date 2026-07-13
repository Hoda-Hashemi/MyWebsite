import { Github, Linkedin, Mail } from "lucide-react";
import { site, nav } from "@/lib/site";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1fr_auto_auto] md:gap-20">
        <div className="max-w-sm">
          <span aria-hidden="true" className="monogram block text-4xl text-accent">
            هـ
          </span>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {site.name} — computational physicist. Ocean dynamics, numerical
            modeling, GPU computing, and tools that make simulation feel simple.
          </p>
          <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
            {site.location} · {new Date().getFullYear()}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5">
          <span className="tag mb-1">// Index</span>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit text-sm text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5">
          <span className="tag mb-1">// Contact</span>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <Github className="h-3.5 w-3.5" aria-hidden="true" /> GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <Linkedin className="h-3.5 w-3.5" aria-hidden="true" /> LinkedIn
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span aria-hidden="true">:: discretize · solve · verify ::</span>
        </div>
      </div>
    </footer>
  );
}
