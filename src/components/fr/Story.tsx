import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const CHAPTERS = [
  {
    k: "01",
    title: "Digital workflows are fragile.",
    body: "Dozens of automated steps hand off to each other. One broken link stalls everything downstream.",
    tone: "neutral",
  },
  {
    k: "02",
    title: "Failure detected.",
    body: "ERROR DETECTED · WORKFLOW PAUSED — FlowRescue catches the break the moment it happens.",
    tone: "fail",
  },
  {
    k: "03",
    title: "AI investigates.",
    body: "Failure: invoice generation failed. Probable cause: missing customer GST information. Confidence: 94%.",
    tone: "accent",
  },
  {
    k: "04",
    title: "AI creates a recovery plan.",
    body: "Request missing information → validate → retry invoice → resume shipping.",
    tone: "accent",
  },
  {
    k: "05",
    title: "FlowRescue executes.",
    body: "Approved actions run in order. The pipeline starts moving again from the exact point it stopped.",
    tone: "accent",
  },
  {
    k: "06",
    title: "Workflow rescued.",
    body: "Recovery time 4.2 sec · human intervention 0 · steps recovered 4.",
    tone: "ok",
  },
] as const;

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const line = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative px-6 py-24">
      <div className="mx-auto w-[min(1180px,94vw)]">
        <div className="relative border-l border-border pl-8 sm:pl-14">
          <motion.div
            style={{ height: line }}
            className="absolute left-[-1px] top-0 w-px"
          >
            <div className="h-full w-px bg-gradient-to-b from-primary via-violet to-success" />
          </motion.div>

          {CHAPTERS.map((c, i) => (
            <motion.div
              key={c.k}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative min-h-[46vh] py-10"
            >
              <span
                className={`absolute -left-[41px] top-12 h-2.5 w-2.5 rounded-full sm:-left-[65px] ${
                  c.tone === "fail"
                    ? "bg-destructive"
                    : c.tone === "ok"
                      ? "bg-success"
                      : c.tone === "accent"
                        ? "bg-primary"
                        : "bg-muted-foreground"
                }`}
              />
              <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">
                {c.k}
              </span>
              <h3 className="mt-4 max-w-2xl text-2xl font-semibold sm:text-4xl">{c.title}</h3>
              <p className="mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
                {c.body}
              </p>
              <StoryVisual index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryVisual({ index }: { index: number }) {
  const nodes = 5;
  const broken = index >= 1 && index <= 4;
  const healed = index === 5;

  return (
    <div className="mt-8 max-w-2xl">
      <svg viewBox="0 0 520 70" className="w-full">
        {Array.from({ length: nodes - 1 }, (_, i) => (
          <motion.line
            key={i}
            x1={40 + i * 110}
            y1={35}
            x2={150 + i * 110}
            y2={35}
            stroke={
              broken && i >= 2
                ? "color-mix(in oklab, var(--destructive) 45%, transparent)"
                : healed
                  ? "color-mix(in oklab, var(--success) 55%, transparent)"
                  : "color-mix(in oklab, var(--primary) 40%, transparent)"
            }
            strokeWidth={1.2}
            strokeDasharray="6 6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.12 }}
          />
        ))}
        {Array.from({ length: nodes }, (_, i) => {
          const failed = broken && i === 3;
          return (
            <g key={i}>
              <motion.rect
                x={40 + i * 110 - 16}
                y={19}
                width={32}
                height={32}
                rx={9}
                fill={
                  failed
                    ? "color-mix(in oklab, var(--destructive) 22%, transparent)"
                    : healed
                      ? "color-mix(in oklab, var(--success) 18%, transparent)"
                      : "color-mix(in oklab, var(--primary) 14%, transparent)"
                }
                stroke={
                  failed ? "var(--destructive)" : healed ? "var(--success)" : "var(--primary)"
                }
                strokeWidth={1}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{ transformOrigin: `${40 + i * 110}px 35px` }}
              />
              {failed && (
                <motion.circle
                  cx={40 + i * 110}
                  cy={35}
                  r={22}
                  fill="none"
                  stroke="var(--destructive)"
                  strokeWidth={0.8}
                  animate={{ opacity: [0.7, 0], scale: [0.8, 1.5] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ transformOrigin: `${40 + i * 110}px 35px` }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
