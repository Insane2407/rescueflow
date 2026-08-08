import { Activity, Brain, History, PieChart, ShieldCheck, Workflow } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeading } from "./primitives";

const FEATURES = [
  { icon: Brain, t: "AI Failure Diagnosis", d: "Understand why workflows fail." },
  { icon: Workflow, t: "Intelligent Recovery Plans", d: "Generate context-aware recovery strategies." },
  { icon: ShieldCheck, t: "Safe Automation", d: "Use human approval for sensitive actions." },
  { icon: Activity, t: "Workflow Monitoring", d: "Track workflows in real time." },
  { icon: PieChart, t: "Failure Analytics", d: "Identify recurring failure patterns." },
  { icon: History, t: "Recovery History", d: "Understand what was fixed and how." },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <SectionHeading eyebrow="Features" title="Built for operators, not dashboards." />

      <div className="mx-auto mt-16 grid w-[min(1180px,94vw)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
            style={{ transformPerspective: 900 }}
            className="clay group rounded-[2rem] p-6 transition-colors duration-500 hover:border-primary/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl glass text-primary transition-all group-hover:glow-ring">
              <f.icon size={20} strokeWidth={1.6} />
            </div>
            <h3 className="mt-6 text-base font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
