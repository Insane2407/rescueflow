import { motion } from "motion/react";
import { SectionHeading } from "./primitives";

const STAGES = [
  { n: "01", t: "Detect", d: "Detect workflow failures in real time across every event stream." },
  { n: "02", t: "Diagnose", d: "AI analyzes errors, workflow state and surrounding context." },
  { n: "03", t: "Decide", d: "AI generates the safest recovery strategy for the failure class." },
  { n: "04", t: "Recover", d: "Execute approved recovery actions step by step, with guardrails." },
  { n: "05", t: "Resume", d: "Continue the workflow from exactly where it stopped." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative px-6 py-28">
      <SectionHeading
        eyebrow="How it works"
        title="Five stages from failure to resumed."
        sub="Every rescue follows the same disciplined loop — observable, auditable and reversible."
      />

      <div className="mx-auto mt-16 w-[min(1180px,94vw)]">
        <div className="relative grid gap-4 lg:grid-cols-5">
          <div className="pointer-events-none absolute left-0 right-0 top-[54px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <div className="glass h-full rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[var(--shadow-glow)]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <span className="h-2 w-2 rounded-full bg-primary/70 transition-all group-hover:shadow-[0_0_12px_var(--primary)]" />
                </div>
                <h3 className="mt-6 text-base font-semibold uppercase tracking-[0.16em]">{s.t}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
