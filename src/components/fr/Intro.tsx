import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

const PARTICLES = 26;

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [gone, setGone] = useState(false);


  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => {
        const a = (i / PARTICLES) * Math.PI * 2 + i * 0.3;
        const r = 70 + ((i * 37) % 110);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.62, d: (i % 7) * 0.05 };
      }),
    [],
  );
  const fail = particles[9];



  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 2100),
      setTimeout(() => setPhase(4), 2900),
      setTimeout(() => finish(), 3600),
    ];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    setGone(true);
    setTimeout(onDone, 700);
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-100 flex items-center justify-center bg-background"
          exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 grid-veil opacity-40" />
          <div className="relative flex flex-col items-center">
            <div className="relative h-[240px] w-[340px] sm:w-[520px]">
              <svg viewBox="-260 -120 520 240" className="absolute inset-0 h-full w-full">
                {particles.map((p, i) => (
                  <g key={i}>
                    <motion.line
                      x1={0}
                      y1={0}
                      x2={p.x}
                      y2={p.y}
                      stroke={
                        phase >= 2 && i === 9
                          ? "var(--destructive)"
                          : "color-mix(in oklab, var(--primary) 45%, transparent)"
                      }
                      strokeWidth={0.6}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: phase >= 1 ? 1 : 0,
                        opacity: phase >= 1 ? 0.55 : 0,
                      }}
                      transition={{ duration: 0.7, delay: p.d }}
                    />
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={i === 9 ? 4 : 1.8}
                      fill={
                        i === 9
                          ? phase === 2
                            ? "var(--destructive)"
                            : phase >= 3
                              ? "var(--success)"
                              : "var(--primary)"
                          : "var(--primary)"
                      }
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 0.9,
                        scale: i === 9 && phase === 2 ? [1, 1.6, 1] : 1,
                      }}
                      transition={{
                        duration: i === 9 && phase === 2 ? 0.8 : 0.5,
                        delay: p.d,
                        repeat: i === 9 && phase === 2 ? Infinity : 0,
                      }}
                    />
                  </g>
                ))}
                {phase >= 3 && fail && (
                  <motion.circle
                    cx={fail.x}
                    cy={fail.y}
                    r={16}
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth={1}
                    initial={{ scale: 0.3, opacity: 1 }}
                    animate={{ scale: [0.4, 1.4], opacity: [1, 0] }}
                    transition={{ duration: 1.1, repeat: 1 }}
                    style={{ transformOrigin: `${fail.x}px ${fail.y}px` }}
                  />
                )}

                <motion.circle
                  cx={0}
                  cy={0}
                  r={9}
                  fill="var(--primary)"
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  cx={0}
                  cy={0}
                  r={9}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1}
                  animate={{ scale: [1, 3], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </svg>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14, letterSpacing: "0.6em" }}
              animate={
                phase >= 1
                  ? { opacity: 1, y: 0, letterSpacing: "0.34em" }
                  : { opacity: 0, y: 14 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-xl font-semibold uppercase sm:text-3xl"
            >
              Flow<span className="text-gradient">rescue</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
            >
              AI-powered workflow recovery.
            </motion.p>

            <div className="mt-6 h-5">
              <AnimatePresence mode="wait">
                {phase === 2 && (
                  <motion.span
                    key="fail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[11px] uppercase tracking-[0.24em] text-destructive"
                  >
                    Node failure detected
                  </motion.span>
                )}
                {phase === 3 && (
                  <motion.span
                    key="resc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary"
                  >
                    Rescue sequence running
                  </motion.span>
                )}
                {phase >= 4 && (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-[11px] uppercase tracking-[0.24em] text-success"
                  >
                    Workflow restored ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={finish}
            className="absolute bottom-8 right-8 rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
