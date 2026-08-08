import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fr-logo" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <path
        d="M20 3 L34 11 V29 L20 37 L6 29 V11 Z"
        stroke="url(#fr-logo)"
        strokeWidth="1.6"
        fill="color-mix(in oklab, var(--primary) 10%, transparent)"
      />
      <path
        d="M20 11 v7 h6 M20 29 v-7 h-6"
        stroke="url(#fr-logo)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="2.6" fill="var(--primary)" />
    </svg>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl text-left"
      }
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub ? (
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">{sub}</p>
      ) : null}
    </motion.div>
  );
}

export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent =
          prefix +
          v.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix;
      }
    });
  }, [spring, decimals, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
