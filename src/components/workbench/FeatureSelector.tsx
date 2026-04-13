"use client";

import { motion } from "motion/react";
import type { Feature } from "./types";

type FeatureSelectorProps = {
  features: Feature[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function FeatureSelector({
  features,
  activeId,
  onSelect,
}: FeatureSelectorProps) {
  return (
    <nav className="flex items-center gap-1 border-b border-border px-1">
      {features.map((feature) => {
        const isActive = feature.id === activeId;
        return (
          <button
            key={feature.id}
            type="button"
            onClick={() => onSelect(feature.id)}
            className={`relative px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
              isActive ? "text-foreground" : "text-muted hover:text-foreground/70"
            }`}
          >
            {feature.label}
            {isActive && (
              <motion.div
                layoutId="feature-underline"
                className="absolute inset-x-0 bottom-0 h-px bg-foreground"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
