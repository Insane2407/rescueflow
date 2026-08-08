import { motion } from "motion/react";
import { SectionHeading, Reveal } from "./primitives";

const NODES = [
  { t: "Frontend", d: "React / Tailwind", x: 50, y: 12 },
  { t: "Backend", d: "Python / FastAPI", x: 15, y: 45 },
  { t: "AI", d: "LLM diagnosis & planning", x: 85, y: 45 },
  { t: "Database", d: "Supabase / PostgreSQL", x: 28, y: 85 },
  { t: "Workflow Engine", d: "Event-driven simulation", x: 72, y: 85 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 4],
  [3, 4],
];

export function Technology() {
  return (
    <section id="technology" className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Technology"
        title="An architecture built around the recovery loop."
      />

      <div className="mx-auto mt-16 w-[min(1000px,94vw)]">
        <div className="glass relative rounded-3xl p-6 sm:p-10">
          <div className="relative hidden h-[440px] sm:block">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {EDGES.map(([a, b], i) => {
                const A = NODES[a]!;
                const B = NODES[b]!;
                return (
                  <motion.line
                    key={i}
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke="color-mix(in oklab, var(--primary) 45%, transparent)"
                    strokeWidth={0.18}
                    strokeDasharray="1.4 1.4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.12 }}
                  />
                );
              })}
            </svg>
            {NODES.map((n, i) => (
              <motion.div
                key={n.t}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.09 }}
                whileHover={{ y: -4 }}
                className="absolute w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-2/80 p-4 text-center backdrop-blur-md transition-colors hover:border-primary/40"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {n.t}
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">{n.d}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-3 sm:hidden">
            {NODES.map((n, i) => (
              <Reveal key={n.t} delay={i * 0.06}>
                <div className="rounded-xl border border-border bg-surface-2/70 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    {n.t}
                  </p>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">{n.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const RISKS = [
  { l: "Low-risk action", r: "Automatic recovery", tone: "success" },
  { l: "Medium-risk action", r: "AI recommendation", tone: "warning" },
  { l: "High-risk action", r: "Human approval required", tone: "destructive" },
] as const;

export function HumanControl() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="Safety"
        title="AI should automate responsibly."
        sub="Every recovery action is classified before it runs. Authority scales with risk — never the other way around."
      />

      <div className="mx-auto mt-14 grid w-[min(980px,94vw)] gap-3">
        {RISKS.map((r, i) => (
          <Reveal key={r.l} delay={i * 0.08}>
            <div className="glass flex flex-col gap-3 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${r.tone === "success" ? "bg-success" : r.tone === "warning" ? "bg-warning" : "bg-destructive"}`} />
                <span className="text-sm">{r.l}</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                → {r.r}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
