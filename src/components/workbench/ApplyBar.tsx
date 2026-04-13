"use client";

import { AnimatePresence, motion } from "motion/react";

type ApplyBarProps = {
  changeCount: number;
  attachmentCount: number;
  onApply: () => void;
};

export function ApplyBar({
  changeCount,
  attachmentCount,
  onApply,
}: ApplyBarProps) {
  const totalChanges = changeCount + attachmentCount;

  return (
    <AnimatePresence>
      {totalChanges > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <button
            type="button"
            onClick={onApply}
            className="flex items-center gap-3 rounded-full border border-accent/30 bg-surface-raised px-6 py-3 shadow-lg shadow-accent/5 transition-all hover:border-accent hover:shadow-accent/10"
          >
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[10px] font-semibold text-white">
              {totalChanges}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-foreground">
              Apply changes
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
