import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Workflow, fetchWorkflows, fetchWorkflow, createWorkflow } from "@/lib/api";

const STAGES = ["ORDER", "PAYMENT", "INVENTORY", "INVOICE", "SHIPPING"] as const;
const FAIL_INDEX = 3;

// phases: 0 healthy · 1 failure · 2 diagnosing · 3 plan · 4 rescued
const TIMINGS = [3200, 2200, 2600, 3000, 3200];

export function Hero() {
  const [phase, setPhase] = useState(0);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    let active = true;
    let interval: ReturnType<typeof setInterval>;
    
    async function poll() {
      try {
        let wfId = workflow?.id;
        if (!wfId) {
          const wfs = await fetchWorkflows();
          if (wfs.length > 0) {
            wfId = wfs[wfs.length - 1]!.id;
          } else {
            const newWf = await createWorkflow();
            wfId = newWf.id;
          }
        }
        if (wfId && active) {
          const fresh = await fetchWorkflow(wfId);
          setWorkflow(fresh);
          
          if (fresh.status === "FAILED") {
            // Give it a moment, then optionally animate through 1 -> 2 -> 3
            // For now, let's just stick to phase 1 to show the failure
            setPhase((p) => (p === 0 ? 1 : p));
          } else if (fresh.status === "COMPLETED") {
            setPhase(4);
          } else {
            setPhase(0);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    poll();
    interval = setInterval(poll, 1500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [workflow?.id]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 80, damping: 18 });

  function statusOf(i: number) {
    if (!workflow) return "wait";
    const stepName = STAGES[i];
    const step = workflow.steps.find((s) => s.step_name === stepName);
    if (!step) return "wait";
    if (step.status === "COMPLETED") return "ok";
    if (step.status === "FAILED") return "fail";
    if (step.status === "RUNNING") return "ok"; // Show as running/ok visually
    return "wait";
  }

  return (
    <section
      id="product"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      className="relative overflow-hidden px-4 sm:px-6 pb-24 pt-36 sm:pt-44"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-veil)" }}
      />
      <div className="pointer-events-none absolute inset-0 grid-veil opacity-50" />

      <div className="relative mx-auto grid w-[min(1180px,94vw)] gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Autonomous workflow recovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.03] sm:text-6xl lg:text-[4.1rem]"
          >
            When workflows fail,
            <br />
            <span className="text-gradient">AI rescues them.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          >
            FlowRescue detects failed digital workflows, understands what went wrong, generates a
            recovery plan, and gets the process running again — with minimal human intervention.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <button
              onClick={() =>
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
              }
              className="clay group relative overflow-hidden rounded-full px-6 py-3 text-sm font-medium text-foreground glow-ring transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6)] hover:brightness-110 active:scale-[0.98]"
              style={{ background: "var(--gradient-accent)" }}
            >
              🚑 Watch FlowRescue in Action
            </button>
            <button
              onClick={() =>
                document.getElementById("technology")?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-full border border-border bg-surface/50 px-6 py-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-[0.98]"
            >
              Explore the Technology
            </button>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>97.2% recovery rate</span>
            <span>4.2s median rescue</span>
            <span>0 human steps</span>
          </div>
        </div>

        <motion.div
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
          className="relative"
        >
          <WorkflowBoard phase={phase} statusOf={statusOf} workflow={workflow} />
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowBoard({
  phase,
  statusOf,
  workflow,
}: {
  phase: number;
  statusOf: (i: number) => string;
  workflow: Workflow | null;
}) {
  return (
    <div className="glass relative rounded-[2rem] p-5 shadow-[var(--shadow-panel)] sm:p-7">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          pipeline / {workflow?.id.slice(0, 8) || "order-1024"}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
              phase === 0 || phase === 4
                ? "text-success"
                : phase === 1
                  ? "text-destructive"
                  : "text-primary"
            }`}
          >
            {phase === 0
              ? "All systems healthy"
              : phase === 1
                ? "Workflow interrupted"
                : phase === 2
                  ? "Diagnosing…"
                  : phase === 3
                    ? "Recovery plan ready"
                    : "Workflow rescued ✓"}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="mt-5 space-y-2.5">
        {STAGES.map((s, i) => {
          const st = statusOf(i);
          return (
            <div key={s} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.09, duration: 0.6 }}
                className={`clay flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                  st === "fail"
                    ? "animate-pulse-fail border-destructive/60 bg-destructive/20 shadow-[0_0_20px_rgba(231,76,60,0.15)]"
                    : st === "ok"
                      ? "border-success/40 bg-success/[0.1] shadow-[0_0_15px_rgba(46,204,113,0.1)]"
                      : "border-border/40 bg-surface-2/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      st === "fail" ? "bg-destructive" : st === "ok" ? "bg-success" : "bg-muted-foreground/50"
                    }`}
                  />
                  <span className="text-[13px] font-medium tracking-[0.12em]">{s}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {st === "fail" ? "failed" : st === "ok" ? "complete" : "waiting"}
                </span>
              </motion.div>
              {i < STAGES.length - 1 && (
                <div className="ml-[22px] h-2.5 w-px bg-gradient-to-b from-border to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 min-h-[92px] rounded-xl glass border border-primary/40 p-4 shadow-[0_0_20px_rgba(67,61,139,0.15)]">
        <AnimatePresence mode="wait">
          {phase <= 1 && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {phase === 0 ? "monitoring 1,284 workflows" : "invoice · step failed"}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {phase === 0
                  ? "Event stream nominal. No anomalies in the last 60 seconds."
                  : "Downstream shipping paused pending recovery."}
              </p>
            </motion.div>
          )}
          {phase === 2 && (
            <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Diagnosing…
              </p>
              <p className="mt-2 text-[13px] text-foreground">
                Missing customer information detected.
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">confidence 94%</p>
            </motion.div>
          )}
          {phase === 3 && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Recovery path
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {["REQUEST", "VALIDATE", "RETRY", "RESUME"].map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.22 }}
                    className="rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em]"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
          {phase === 4 && (
            <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-success">
                Workflow rescued ✓
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Invoice regenerated · shipping resumed · 4.2s · 0 human steps.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
