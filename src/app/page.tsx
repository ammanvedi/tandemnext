"use client";

import { Workbench } from "@/components/workbench";
import type { Application, Feature, ForkNode, SearchResult } from "@/components/workbench";

const applications: Record<string, Application> = {
  "app-alpha": {
    id: "app-alpha",
    iframeBaseUrl: "https://en.wikipedia.org/wiki/Systems_design",
  },
  "app-beta": {
    id: "app-beta",
    iframeBaseUrl: "https://en.wikipedia.org/wiki/Software_architecture",
  },
  "app-gamma": {
    id: "app-gamma",
    iframeBaseUrl: "https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction",
  },
};

const features: Feature[] = [
  {
    id: "architecture",
    label: "Architecture",
    applicationId: "app-alpha",
    markdown: `# System Architecture

In an age of abstraction, we have forgotten the *texture of the machine*. The way **memory aligns** at cache boundaries, the dance of **prefetch instructions** ahead of the data stream.

## Core Principles

Complexity is often mistaken for progress. We layer **frameworks upon frameworks** until the original intent is buried under megabytes of *runtime overhead*.

### Design Constraints

- The system must honor **single-writer principle** across all *shared state boundaries*
- Every **mutation path** traces back to an *explicit intent declaration*
- We optimize for **mechanical sympathy** — understanding the hardware beneath the abstraction

> The best architecture is the one that disappears. It becomes invisible because it so perfectly matches the shape of the problem.

Consider the **event-driven topology**: messages flow through *bounded channels*, each handler a pure transformation. No hidden state. No temporal coupling. Just **data in, data out**.
`,
  },
  {
    id: "performance",
    label: "Performance",
    applicationId: "app-beta",
    markdown: `# Performance Engineering

I believe in Computing as Craft. The meticulous arrangement of bits, the surgical precision of **memory management**, and the *elegant brutality* of a well-tuned system.

## Profiling Strategy

Before optimizing, we measure. **Flame graphs** reveal the truth that *intuition hides*. Every microsecond has a story.

### Critical Paths

- The **hot loop** in the rendering pipeline processes *vertex transformations* at 16ms intervals
- **Cache coherence** matters more than **algorithmic complexity** at the *scale of modern hardware*
- We pre-allocate **arena pools** to eliminate *allocation pressure* during critical frames

The goal is not raw speed — it is **predictable latency**. A system that is fast on average but *occasionally catastrophic* is worse than one that is consistently adequate.

## Memory Model

Understanding the **memory hierarchy** is non-negotiable. L1 cache misses cost 4 cycles. L2 costs 12. Main memory? 200+. Design your *data layout* accordingly.
`,
  },
  {
    id: "interface",
    label: "Interface",
    applicationId: "app-gamma",
    markdown: `# Interface Philosophy

The interface is the argument made visible. Every **pixel placement** is a rhetorical choice, every *interaction pattern* a conversation with the user.

## Typography as Structure

We do not merely display text — we **orchestrate reading**. The rhythm of *line heights*, the tension between **display and body**, the breath of whitespace.

### Interaction Grammar

- **Direct manipulation** creates a sense of *physical ownership* over digital objects
- Every **state transition** should feel like a *natural consequence* of the user's gesture
- **Progressive disclosure** — reveal complexity only when the user reaches for it

> Elegance is not the absence of complexity but the successful concealment of it.

The best interfaces feel like *an extension of thought*. No translation layer between **intention and result**. The tool vanishes, and only the work remains.

## Motion Design

Animation is not decoration — it is **information**. A spring curve tells the user about *mass and friction*. An ease-out suggests **momentum carrying forward**.
`,
  },
];

async function handleSearch(
  query: string,
  _applicationId: string,
): Promise<SearchResult[]> {
  await new Promise((r) => setTimeout(r, 300));
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const feature of features) {
    const lines = feature.markdown.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const plain = line.replace(/[#*_>`-]/g, "").trim();
      if (plain.toLowerCase().includes(q)) {
        const idx = plain.toLowerCase().indexOf(q);
        const matchText = plain.slice(idx, idx + query.length);
        const start = Math.max(0, idx - 40);
        const end = Math.min(plain.length, idx + query.length + 40);
        const context =
          (start > 0 ? "..." : "") +
          plain.slice(start, end) +
          (end < plain.length ? "..." : "");
        results.push({ featureId: feature.id, matchText, context });
      }
    }
  }
  return results.slice(0, 10);
}

let forkCounter = 0;

async function handleInspoRequest(text: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 600));
  const seed = text.length;
  return Array.from({ length: 6 }, (_, i) => {
    const id = (seed * 17 + i * 31) % 1000;
    return `https://picsum.photos/seed/${id}/400/300`;
  });
}

async function handleForkRequest(_currentState: ForkNode): Promise<Application> {
  await new Promise((r) => setTimeout(r, 800));
  forkCounter++;
  const id = `app-fork-${forkCounter}`;
  return {
    id,
    iframeBaseUrl: `https://en.wikipedia.org/wiki/Fork_(software_development)`,
  };
}

export default function Home() {
  return (
    <Workbench
      applications={applications}
      features={features}
      initialFeatureId="architecture"
      onInspoRequest={handleInspoRequest}
      onForkRequest={handleForkRequest}
      onSearch={handleSearch}
    />
  );
}
