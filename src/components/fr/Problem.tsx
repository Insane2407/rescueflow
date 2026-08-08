import { motion } from "motion/react";
import { SectionHeading, Reveal } from "./primitives";

const CASES = [
  {
    title: "Missing information",
    body: "A required field never arrives. The invoice step throws and the pipeline halts.",
    tone: "warning",
  },
  {
    title: "API failure",
    body: "A downstream service times out. Retries exhaust and the job is abandoned mid-flight.",
    tone: "destructive",
  },
  {
    title: "Invalid data",
    body: "A malformed payload passes the queue but fails validation deeper in the chain.",
    tone: "violet",
  },
] as const;

export function Problem() {
  return (
    <section className="relative px-6 py-28">
      <SectionHeading
        eyebrow="The problem"
        title={
          <>
            Automation is powerful.
            <br />
            <span className="text-muted-foreground">But what happens when automation breaks?</span>
          </>
        }
      />

      <div className="mx-auto mt-16 grid w-[min(1180px,94vw)] gap-5 md:grid-cols-3">
        {CASES.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className="group glass h-full rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/30">
              <svg viewBox="0 0 240 60" className="w-full">
                {[0, 1, 2].map((n) => (
                  <line
                    key={n}
                    x1={30 + n * 70}
                    y1={30}
                    x2={100 + n * 70}
                    y2={30}
                    stroke="color-mix(in oklab, var(--foreground) 12%, transparent)"
                    strokeWidth={1}
                  />
                ))}
                {[0, 1, 2, 3].map((n) => (
                  <circle
                    key={n}
                    cx={30 + n * 70}
                    cy={30}
                    r={7}
                    fill="none"
                    stroke={
                      n === 2
                        ? `var(--${c.tone})`
                        : "color-mix(in oklab, var(--foreground) 22%, transparent)"
                    }
                    strokeWidth={1.2}
                  />
                ))}
                <motion.circle
                  cx={170}
                  cy={30}
                  r={7}
                  fill="none"
                  stroke={`var(--${c.tone})`}
                  strokeWidth={1}
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ transformOrigin: "170px 30px" }}
                />
              </svg>
              <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-14 flex w-[min(1180px,94vw)] flex-col items-center gap-6 text-center sm:flex-row sm:justify-center sm:gap-10">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            Traditional automation stops and waits for a human
          </p>
          <span className="text-muted-foreground">→</span>
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-gradient">
            FlowRescue detects, diagnoses and recovers
          </p>
        </div>
      </Reveal>
    </section>
  );
}
