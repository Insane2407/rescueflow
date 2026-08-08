import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Counter, Reveal, SectionHeading } from "./primitives";
import { fetchAnalytics } from "@/lib/api";

export function Insights() {
  const [failures, setFailures] = useState<{ label: string; pct: number }[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnalytics();
        setFailures(data.failure_categories);
        
        if (data.failure_categories.length > 0) {
          const top = data.failure_categories[0]!;
          setInsights([
            `${top.pct}% of failures originate from ${top.label.toLowerCase()}.`,
            `${Math.round(data.recovery_success_rate)}% of recent workflow failures were recoverable automatically.`,
            `Automated rescues have already saved ${data.time_saved_hours} hours of manual intervention.`
          ]);
        } else {
          setInsights([
            "Workflow engine is running smoothly with no significant failures.",
            `${Math.round(data.recovery_success_rate)}% recovery success rate guarantees zero downtime.`,
            "FlowRescue is actively monitoring the pipeline."
          ]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative px-4 sm:px-6 py-28">
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
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-24 animate-pulse rounded bg-surface-2/40" />
                        <div className="h-4 w-8 animate-pulse rounded bg-surface-2/40" />
                      </div>
                      <div className="h-1.5 w-full animate-pulse rounded-full bg-surface-2/20" />
                    </div>
                  ))}
                </>
              ) : (
                failures.map((f, i) => (
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
                        whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: "var(--gradient-accent)" }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4">
          {insights.map((t, i) => (
            <Reveal key={t + i} delay={i * 0.1}>
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

export function Impact() {
  const [stats, setStats] = useState<{ v: number, d: number, suffix: string, label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAnalytics();
        
        setStats([
          { v: data.recovery_success_rate, d: 1, suffix: "%", label: "Recovery Success Rate" },
          { v: data.time_saved_hours, d: 1, suffix: " hrs", label: "Human Time Saved" },
          { v: data.total_workflows, d: 0, suffix: "", label: "Workflows Monitored" },
          { v: data.rescued_workflows, d: 0, suffix: "", label: "Workflows Rescued" },
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative px-4 sm:px-6 py-24">
      <div className="mx-auto grid w-[min(1180px,94vw)] gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface/70 p-8 text-center backdrop-blur-md"
              >
                <div className="mx-auto h-12 w-24 animate-pulse rounded bg-surface-2/40" />
                <div className="mx-auto mt-4 h-3 w-32 animate-pulse rounded bg-surface-2/40" />
              </div>
            ))
          : stats.map((s, i) => (
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
