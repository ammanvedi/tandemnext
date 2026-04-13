"use client";

import { motion } from "motion/react";

type IFramePanelProps = {
  url: string;
  featureId: string;
};

export function IFramePanel({ url, featureId }: IFramePanelProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-surface-raised px-4">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-3 flex-1 rounded bg-background/50 px-3 py-1 font-mono text-[11px] text-muted truncate">
          {url}
        </div>
      </div>
      <motion.div
        key={featureId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-[calc(100%-2.5rem)] w-full"
      >
        <iframe
          src={url}
          title="Application preview"
          className="h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </motion.div>
    </div>
  );
}
