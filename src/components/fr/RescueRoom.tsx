import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SectionHeading } from "./primitives";

const STEPS = [
  "Detecting failure...",
  "Analyzing cause...",
  "Generating recovery plan...",
  "Requesting information...",
  "Validating...",
  "Retrying failed step...",
  "Resuming workflow...",
];

type Stage = { name: string; state: "ok" | "fail" | "wait" };

const INITIAL: Stage[] = [
  { name: "Order", state: "ok" },
  { name: "Payment", state: "ok" },
  { name: "Inventory", state: "ok" },
  { name: "Invoice", state: "fail" },
  { name: "Shipping", state: "wait" },
];

export function RescueRoom() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [rescued, setRescued] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (done >= STEPS.length) {
      const t = setTimeout(() => {
        setRescued(true);
        setRunning(false);
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 520);
    return () => clearTimeout(t);
  }, [running, done]);

  const stages: Stage[] = rescued
    ? INITIAL.map((s) => ({ ...s, state: "ok" }))
    : done >= 6
      ? INITIAL.map((s, i) => (i === 3 ? { ...s, state: "ok" } : s))
      : INITIAL;

  function reset() {
    setRescued(false);
    setDone(0);
    setRunning(true);
  }

  return (
    <section id="demo" className="relative px-6 py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[420px]"
        style={{ background: "var(--gradient-veil)", opacity: 0.5 }}
      />
      <SectionHeading
        eyebrow="Live demo"
        title="The Rescue Room."
        sub="A live failure, an AI diagnosis and a one-click recovery — exactly as an operator sees it."
      />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-14 w-[min(1180px,94vw)]"
      >
        <div className="glass overflow-hidden rounded-3xl shadow-[var(--shadow-panel)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                flowrescue · rescue room
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">Order #1024</span>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
            <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Pipeline state
              </p>
              <div className="mt-5 space-y-2.5">
                {stages.map((s) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-500 ${
                      s.state === "fail"
                        ? "animate-pulse-fail border-destructive/50 bg-destructive/10"
                        : s.state === "ok"
                          ? "border-success/25 bg-success/[0.06]"
                          : "border-border bg-surface-2/40"
                    }`}
                  >
                    <span className="text-sm">{s.name}</span>
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
                        s.state === "fail"
                          ? "text-destructive"
                          : s.state === "ok"
                            ? "text-success"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.state === "fail" ? "🔴 failed" : s.state === "ok" ? "✓ complete" : "⏸ waiting"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                AI diagnosis
              </p>
              <p className="mt-3 text-[15px] leading-relaxed">
                Invoice generation failed because customer GST information is missing.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "94%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="h-full"
                    style={{ background: "var(--gradient-accent)" }}
                  />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">confidence 94%</span>
              </div>

              <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Recommended recovery
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {["Request", "Validate", "Retry", "Resume"].map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-surface-2/60 px-2.5 py-1 font-mono text-[11px] tracking-[0.14em]"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <button
                onClick={reset}
                disabled={running}
                className="mt-7 w-full rounded-full px-6 py-3 text-sm font-medium text-foreground glow-ring transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: "var(--gradient-accent)" }}
              >
                {running ? "Rescuing…" : rescued ? "🚑 Run rescue again" : "🚑 Rescue workflow"}
              </button>

              <div className="mt-6 min-h-[190px] rounded-xl border border-border bg-background/60 p-4 font-mono text-[12px]">
                {done === 0 && !rescued ? (
                  <span className="text-muted-foreground">
                    awaiting operator command…
                  </span>
                ) : null}
                <AnimatePresence>
                  {STEPS.slice(0, done).map((s) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between py-0.5"
                    >
                      <span className="text-muted-foreground">{s}</span>
                      <span className="text-success">✓</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {rescued && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-success"
                  >
                    🎉 WORKFLOW RESCUED — 4.2s · 0 human steps
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
