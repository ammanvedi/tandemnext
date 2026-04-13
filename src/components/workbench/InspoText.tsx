"use client";

import { useCallback } from "react";
import { motion } from "motion/react";
import { ShimmerText } from "./ShimmerText";
import type { InspoAttachment } from "./types";

type InspoTextProps = {
  wordId: string;
  children: string;
  onTrigger: (wordId: string, text: string) => void;
  attachments: InspoAttachment[];
};

export function InspoText({
  wordId,
  children,
  onTrigger,
  attachments,
}: InspoTextProps) {
  const handleClick = useCallback(() => {
    onTrigger(wordId, children);
  }, [wordId, children, onTrigger]);

  const myAttachments = attachments.filter((a) => a.wordId === wordId);

  return (
    <motion.span
      className="relative inline cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <span
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        role="button"
        tabIndex={0}
        className="relative inline"
      >
        <ShimmerText fast className="font-serif italic">
          {children}
        </ShimmerText>
      </span>

      {myAttachments.length > 0 && (
        <span className="absolute -right-1 -top-3 flex gap-0.5">
          {myAttachments.map((att) => (
            <motion.span
              key={att.imageUrl}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inspo-badge block h-4 w-4 overflow-hidden rounded-sm border border-border shadow-md"
            >
              <img
                src={att.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </motion.span>
          ))}
        </span>
      )}
    </motion.span>
  );
}
