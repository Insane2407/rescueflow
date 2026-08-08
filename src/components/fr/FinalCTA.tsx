import { motion } from "motion/react";
import { Logo } from "./primitives";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-veil)" }}
      />
      <svg
        viewBox="0 0 800 300"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 14 }, (_, i) => {
          const x = 40 + ((i * 97) % 740);
          const y = 40 + ((i * 61) % 220);
          return (
            <g key={i}>
              <motion.line
                x1={x}
                y1={y}
                x2={400}
                y2={150}
                stroke="color-mix(in oklab, var(--primary) 35%, transparent)"
                strokeWidth={0.5}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: i * 0.05 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r={2}
                fill="var(--primary)"
                animate={{ opacity: [0.25, 0.9, 0.25] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.24 }}
              />
            </g>
          );
        })}
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <h2 className="text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">
          Don&apos;t wait for workflows to fail.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">Build workflows that can recover.</p>
        <button
          onClick={() => scrollTo("demo")}
          className="mt-10 rounded-full px-8 py-3.5 text-sm font-medium text-foreground glow-ring transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--gradient-accent)" }}
        >
          🚑 Launch FlowRescue Demo
        </button>
      </motion.div>
    </section>
  );
}

export function Footer() {
  const links = [
    { l: "Product", id: "product" },
    { l: "How It Works", id: "how" },
    { l: "Technology", id: "technology" },
    { l: "Live Demo", id: "demo" },
  ];
  return (
    <footer className="border-t border-border px-6 py-14">
      <div className="mx-auto flex w-[min(1180px,94vw)] flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">FlowRescue</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">AI-powered workflow recovery.</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
          {links.map((x) => (
            <button key={x.id} onClick={() => scrollTo(x.id)} className="hover:text-foreground">
              {x.l}
            </button>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
      <div className="mx-auto mt-10 w-[min(1180px,94vw)] border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Built for Hackathon 2026
      </div>
    </footer>
  );
}
