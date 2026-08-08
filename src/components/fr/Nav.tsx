import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { Logo } from "./primitives";

const LINKS = [
  { label: "Product", id: "product" },
  { label: "How It Works", id: "how" },
  { label: "Live Demo", id: "demo" },
  { label: "Features", id: "features" },
  { label: "Technology", id: "technology" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto mt-3 flex w-[min(1180px,94vw)] items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
          scrolled ? "glass shadow-[var(--shadow-panel)]" : "border border-transparent"
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5"
        >
          <Logo size={26} />
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">
            Flow<span className="text-muted-foreground">rescue</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="rounded-full px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2/70 hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo("demo")}
            className="rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-[13px] font-medium text-foreground transition-all hover:bg-primary/20 hover:glow-ring"
          >
            View Demo
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border md:hidden"
          >
            <span className="text-xs">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-auto mt-2 flex w-[94vw] flex-col rounded-2xl p-2 md:hidden"
        >
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setOpen(false);
                scrollTo(l.id);
              }}
              className="rounded-xl px-4 py-3 text-left text-sm text-muted-foreground hover:bg-surface-2/70 hover:text-foreground"
            >
              {l.label}
            </button>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}
