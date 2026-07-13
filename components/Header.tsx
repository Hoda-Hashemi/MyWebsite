"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav } from "@/lib/site";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // close the sheet on route change + lock scroll while open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header className="glass fixed inset-x-0 top-0 z-50 border-b border-line">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        {/* desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-[10px] px-3.5 py-2 font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                isActive(item.href)
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/assets/CV_HodaHashemi.pdf"
            download
            className="btn btn-primary hidden h-9 px-4 text-[0.82rem] md:inline-flex"
          >
            Download CV
          </a>
          {/* mobile trigger */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-fg transition-colors hover:border-accent hover:text-accent md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="border-t border-line bg-bg md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center justify-between rounded-[10px] px-4 py-3.5 font-mono text-[0.8rem] font-medium uppercase tracking-[0.14em] ${
                      isActive(item.href)
                        ? "bg-accent-soft text-accent"
                        : "text-fg hover:bg-bg-subtle"
                    }`}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-accent">
                      {"->"}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <a
                href="/assets/CV_HodaHashemi.pdf"
                download
                className="btn btn-primary mt-3"
              >
                Download CV
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
