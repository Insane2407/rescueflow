import { motion } from "motion/react";
import { Counter, Reveal, SectionHeading } from "./primitives";

const FAILURES = [
  { label: "Missing Data", pct: 32 },
  { label: "API Timeout", pct: 24 },
  { label: "Invalid Data", pct: 18 },
  { label: "Payment Failure", pct: 14 },
];

const INSIGHTS = [
  "32% of failures originate from missing customer information.",
  "87% of recent workflow failures were recoverable automatically.",
  "Adding validation before invoice generation could reduce failures by 24%.",
];

export function Insights() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="AI insights"
        title={
          <>
            FlowRescue doesn&apos;t just fix failures.
            <br />
            <span className="text-gradient">It learns from them.</span>
          </>
        }
      />

      <div className="mx-auto mt-16 grid w-[min(1180px,94vw)] gap-5 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <div className="glass h-full rounded-2xl p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Most common failures
            </p>
            <div className="mt-7 space-y-6">
              {FAILURES.map((f, i) => (
                <div key={f.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm">{f.label}</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      <Counter to={f.pct} suffix="%" />
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${f.pct * 2.6}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: "var(--gradient-accent)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4">
          {INSIGHTS.map((t, i) => (
            <Reveal key={t} delay={i * 0.1}>
              <div className="glass flex h-full items-start gap-4 rounded-2xl p-6">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet" />
                <p className="text-[15px] leading-relaxed text-muted-foreground">{t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { v: 97.2, d: 1, suffix: "%", label: "Recovery Success Rate" },
  { v: 18.4, d: 1, suffix: " hrs", label: "Human Time Saved" },
  { v: 1284, d: 0, suffix: "", label: "Workflows Monitored" },
  { v: 34, d: 0, suffix: "", label: "Workflows Rescued" },
];

export function Impact() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto grid w-[min(1180px,94vw)] gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="bg-surface/70 p-8 text-center backdrop-blur-md"
          >
            <p className="text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
              <Counter to={s.v} decimals={s.d} suffix={s.suffix} />
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
