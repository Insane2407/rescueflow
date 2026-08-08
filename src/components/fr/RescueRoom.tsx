import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SectionHeading } from "./primitives";
import { fetchIncidents, fetchWorkflow, Workflow, WorkflowStep, executeRescue } from "@/lib/api";

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
  const [liveSteps, setLiveSteps] = useState<string[]>([]);
  const [rescued, setRescued] = useState(false);

  const [incident, setIncident] = useState<WorkflowStep | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const incs = await fetchIncidents();
        if (incs.length > 0) {
          const latestInc = incs[incs.length - 1]!;
          setIncident(latestInc);
          const wf = await fetchWorkflow(latestInc.workflow_id);
          setWorkflow(wf);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const baseStages: Stage[] = workflow
    ? workflow.steps.map(s => ({
        name: s.step_name.charAt(0) + s.step_name.slice(1).toLowerCase(),
        state: s.status === "COMPLETED" ? "ok" : s.status === "FAILED" ? "fail" : "wait"
      }))
    : INITIAL;

  const hasRetried = liveSteps.some(s => s.includes("Retrying") || s.includes("Resuming"));
  const stages: Stage[] = rescued
    ? baseStages.map((s) => ({ ...s, state: "ok" }))
    : hasRetried
      ? baseStages.map((s) => (s.state === "fail" ? { ...s, state: "ok" } : s))
      : baseStages;

  function runRescue() {
    if (!workflow) return;
    setRunning(true);
    setRescued(false);
    setLiveSteps([]);
    
    executeRescue(workflow.id, 
      (msg) => {
        setLiveSteps(prev => [...prev, msg]);
      }, 
      () => {
        setRescued(true);
        setRunning(false);
      },
      (err) => {
        console.error(err);
        setRunning(false);
      }
    );
  }

  return (
    <section id="demo" className="relative px-4 sm:px-6 py-28">
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
            <span className="font-mono text-[11px] text-muted-foreground">Order #{workflow?.id.slice(0, 8) || "1024"}</span>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
            <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Pipeline state
              </p>
              <div className="mt-5 space-y-2.5">
                {stages.map((s) => (
                  <motion.div
                    layout
                    key={s.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`clay flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                      s.state === "fail"
                        ? "animate-pulse-fail border-destructive/60 bg-destructive/10 shadow-[0_0_20px_rgba(231,76,60,0.15)]"
                        : s.state === "ok"
                          ? "border-success/40 bg-success/[0.06] shadow-[0_0_15px_rgba(46,204,113,0.1)]"
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
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                AI diagnosis
              </p>
              {incident ? (
                <p className="mt-3 text-[15px] leading-relaxed">
                  {incident.error_context?.message || "Invoice generation failed because customer GST information is missing."}
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-surface-2/40" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2/40" />
                </div>
              )}
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 w-40 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${workflow?.active_diagnosis?.confidence || 0}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="h-full"
                    style={{ background: "var(--gradient-accent)" }}
                  />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">confidence {workflow?.active_diagnosis?.confidence || 0}%</span>
              </div>

              <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Recommended recovery
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(workflow?.active_diagnosis?.recommended_actions || []).map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-surface-2/60 px-2.5 py-1 font-mono text-[11px] tracking-[0.14em]"
                  >
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </span>
                ))}
              </div>

              <button
                onClick={runRescue}
                disabled={running}
                className="clay mt-7 w-full rounded-full px-6 py-3 text-sm font-medium text-foreground glow-ring transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.6)] hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 disabled:hover:-translate-y-0 disabled:hover:shadow-none disabled:hover:brightness-100 disabled:active:scale-100"
                style={{ background: "var(--gradient-accent)" }}
              >
                {running ? "Rescuing…" : rescued ? "🚑 Run rescue again" : "🚑 Rescue workflow"}
              </button>

              <div className="mt-6 min-h-[190px] rounded-xl glass border border-primary/40 p-4 font-mono text-[12px] shadow-[0_0_20px_rgba(67,61,139,0.15)]">
                {liveSteps.length === 0 && !rescued ? (
                  <span className="text-muted-foreground">
                    awaiting operator command…
                  </span>
                ) : null}
                <AnimatePresence>
                  {liveSteps.map((s, idx) => (
                    <motion.div
                      layout
                      key={idx + s}
                      initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="flex items-center justify-between py-1"
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
