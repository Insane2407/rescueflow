import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/fr/Nav";
import { Intro } from "@/components/fr/Intro";
import { Hero } from "@/components/fr/Hero";
import { Story } from "@/components/fr/Story";
import { Problem } from "@/components/fr/Problem";
import { HowItWorks } from "@/components/fr/HowItWorks";
import { RescueRoom } from "@/components/fr/RescueRoom";
import { Features } from "@/components/fr/Features";
import { Insights, Impact } from "@/components/fr/Insights";
import { Technology, HumanControl } from "@/components/fr/Technology";
import { FinalCTA, Footer } from "@/components/fr/FinalCTA";

const TITLE = "FlowRescue — AI-powered workflow recovery";
const DESC =
  "FlowRescue detects failed digital workflows, diagnoses the cause with AI, generates a recovery plan and resumes the process — with minimal human intervention.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <Intro onDone={() => setIntroDone(true)} />
      <div
        className="min-h-screen transition-opacity duration-700"
        style={{ opacity: introDone ? 1 : 0 }}
      >
        <Nav />
        <main>
          <Hero />
          <Story />
          <Problem />
          <HowItWorks />
          <RescueRoom />
          <Features />
          <Insights />
          <Impact />
          <Technology />
          <HumanControl />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
